const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: Check if they are logged in

    const item = await ctx.db.mutation.createItem({
      data: {
        ...args
      }
    }, info)

    return item
  },
  updateItem(parent, args, ctx, info) {
    const updates = {...args}
    delete updates.id
    return ctx.db.mutation.updateItem({
      data: updates,
      where: {
        id: args.id
      }
    }, info)
  },
  async deleteItem(parent, args, ctx, info) {
    console.log('deleteItem')
    const where = {id: args.id}
    // find item
    const item = await ctx.db.query.item({where}, `{id title}`)
    console.log(item)
    // check if own or have permissions
    // TODO
    // delete it
    return ctx.db.mutation.deleteItem({where}, info)
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase()
    // hash password
    const password = await bcrypt.hash(args.password, 10)
    // create user in db
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: {set: ['USER']}
      }
    }, info)
    // create jwt token
    const token = jwt.sign({userId: user.id}, process.env.APP_SECRET)
    // set jwt as cookie on response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    })

    return user
  }
}

module.exports = Mutations
