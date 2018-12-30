import React, {Component, Fragment} from 'react'
import {Query, Mutation} from 'react-apollo'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'
import Error from './ErrorMessage'
import Table from './styles/Table'
import SickButton from './styles/SickButton'

const possiblePermissions = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE'
]

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation updatePermissions($permissions: [Permission], $userId: ID!) {
    updatePermissions(permissions: $permissions, userId: $userId) {
      id
      permissions
      name
      email
    }
  }
`

const ALL_USERS_QUERY = gql`
  query {
    users {
      id
      name
      email
      permissions
    }
  }
`

const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({data, loading, error}) => (
      <div>
        <Error error={error} />
        <div>
          <h2>Manage Permissions</h2>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {possiblePermissions.map((permission, i) => (
                  <th key={i}>{permission}</th>
                ))}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user, i) => <UserPermissions key={i} user={user} />)}
            </tbody>
          </Table>
        </div>
      </div>
    )}
  </Query>
)

class UserPermissions extends Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array
    }).isRequired
  }

  state = {
    permissions: this.props.user.permissions
  }

  handlePermissionChange = e => {
    const {checked, value} = e.target
    let updatedPermissions = [...this.state.permissions]
    if (checked) {
      updatedPermissions.push(value)
    } else {
      updatedPermissions = updatedPermissions.filter(p => p !== value)
    }

    this.setState({permissions: updatedPermissions})
  }

  render() {
    const {user} = this.props
    return (
      <Mutation
        mutation={UPDATE_PERMISSIONS_MUTATION}
        variables={{
          permissions: this.state.permissions,
          userId: this.props.user.id
        }}
      >
        {(updatePermissions, {loading, error}) => (
          <Fragment>
            {error && (
              <tr>
                <td colSpan='8'>
                  <Error error={error} />
                </td>
              </tr>)
            }
            <tr>
              <td>{user.name}</td>
              <td>{user.email}</td>
              {possiblePermissions.map((permission, i) => (
                <td key={i}>
                  <label
                    htmlFor={`${user.id}-permission-${permission}`}
                  >
                    <input
                      id={`${user.id}-permission-${permission}`}
                      type='checkbox'
                      checked={this.state.permissions.includes(permission)}
                      value={permission}
                      onChange={this.handlePermissionChange}
                    />
                  </label>
                </td>
              ))}
              <td>
                <SickButton
                  type='button'
                  disabled={loading}
                  onClick={updatePermissions}
                >
                  Updat{loading ? 'ing' : 'e'}
                </SickButton>
              </td>
            </tr>
          </Fragment>
        )}
      </Mutation>
    )
  }
}

export default Permissions
