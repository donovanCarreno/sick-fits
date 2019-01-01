import React, { Component } from 'react'
import {Mutation} from 'react-apollo'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import {CURRENT_USER_QUERY} from './User'

const REMOVE_FROM_CART_MUTATION = gql`
  mutation removeFromCart($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: ${props => props.theme.red};
    cursor: pointer;
  }
`

class RemoveFromCart extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  }

  update = (cache, payload) => {
    // gets called when we get a response back
    // from the server after a mutation
    const data = cache.readQuery({query: CURRENT_USER_QUERY})
    const cartItemId = payload.data.removeFromCart.id

    data.me.cart = data.me.cart.filter(cartItem => cartItem.id !== cartItemId)

    cache.writeQuery({
      query: CURRENT_USER_QUERY,
      data
    })
  }

  render() {
    return (
      <Mutation
        mutation={REMOVE_FROM_CART_MUTATION}
        variables={{id: this.props.id}}
        update={this.update}
        optimisticResponse={{
          __typename: 'Mutation',
          removeFromCart: {
            __typename: 'CartItem',
            id: this.props.id
          }
        }}
      >
        {(removeFromCart, {loading, error}) => (
          <BigButton
            disabled={loading}
            title='Delete Item'
            onClick={() => {
              removeFromCart()
                .catch(e => alert(e.message))
            }}
          >
            &times;
          </BigButton>
        )}
      </Mutation>
    )
  }
}

export default RemoveFromCart