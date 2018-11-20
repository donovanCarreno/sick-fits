const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {randomBytes} = require('crypto')
const {promisify} = require('util')

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
  },
  async signin(parent, {email, password}, ctx, info) {
    const user = await ctx.db.query.user({where: {email}})
    if (!user) {
      throw new Error(`No such user found for email ${email}`)
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid Password!')
    }

    const token = jwt.sign({userId: user.id}, process.env.APP_SECRET)
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    })

    return user
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token')
    return {message: 'Goodbye!'}
  },
  async requestReset(parent, args, ctx, info) {
    const user = await ctx.db.query.user({where: {email: args.email}})
    if (!user) {
      throw new Error(`No such user found for email ${args.email}`)
    }

    const resetToken = (await promisify(randomBytes)(20)).toString('hex')
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: {email: args.email},
      data: {resetToken, resetTokenExpiry}
    })
    
    return {message: 'Thanks'}
  },
  async resetPassword(parent, args, ctx, info) {
    if (args.password !== args.confirmPassword) {
      throw new Error('Yo passwords do not match!')
    }

    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    })
    if (!user) {
      throw new Error('This token is either invalid or expired')
    }

    const password = await bcrypt.hash(args.password, 10)
    const updatedUser = await ctx.db.mutation.updateUser({
      where: {email: user.email},
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    })
    const token = jwt.sign({userId: updatedUser.id}, process.env.APP_SECRET)
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    })

    return updatedUser
  }
}

module.exports = Mutations
