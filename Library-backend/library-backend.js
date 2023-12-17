const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const author = require('./models/author')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = `
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }


  type Author {
    name: String!
    id: ID!
    born: Int
  }

  type User {
    username: String!
    favoriteGenre: String
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [AuthorAndBooks!]!
    me: User
  }

  type AuthorAndBooks {
    name: String
    born: Int
    bookCount: Int!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres:[String!]!
    ): Book

    editAuthor (
      name: String!
      setBornTo: Int!
    ): Author

    setBornTo (
      born: Int!
    ): Author

    createUser(
      username: String!
      favoriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token

  }
`


const resolvers = {
  
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    
    allBooks: async (root, args) => {

      let books = await Book.find({}).populate('author')
      if(args.author && !args.genre) {
        return books.filter(book => args.author === book.author.name)
      }
      else if(args.genre && !args.author) {
        return books.filter(book => book.genres.includes(args.genre))
      }
      else if(args.genre && args.author) {
        return books.filter(book => book.genres.includes(args.genre) && args.author === book.author.name)
      }
      else {
        return books
      }

    },

    allAuthors: async () => {
      const authors = await Author.find({})
      const books = await Book.find({})
      console.log(books)
      console.log(authors)
      return authors.map(author => ({
        ...author.toObject(),
        bookCount: books.filter(book => book.author.toString() === author._id.toString()).length
      })
      )
    },

    me: (root, args, context) => {
      return context.currentUser
    }
  },
    
  Mutation: {
    addBook: async (root, args, context) => { 
      let author = await Author.findOne({ name: args.author })
      const currentUser = context.currentUser

      if(!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }
      try {
        if(!author) {
          const newAuthor = {
            name: args.author,
            born: null
          }
          author = new Author({ ...newAuthor })
          await author.save()     
        }
      
        let book = new Book({ ...args, author: author._id })
      
        await book.save()
        book = book.populate('author')
        return book
      } catch (error) {
          console.error('Error adding book:', error)
          throw new GraphQLError('Error adding book', {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              error: error.message
            }
          })
    }},

    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      if(!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }
      const author = await Author.findOne({ name: args.name })
    
      if(!author) {
        return null
      }
      author.born = args.setBornTo
      try {
        await author.save()
      } catch(error){
          throw new GraphQLError('Must be a number', {
            extensions: {
              code: 'BAD_USER_INPUT'
            }
          })
      }
      return author
    },

    setBornTo: (root, args) => {
      return args
    },

    createUser: async (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })

      return user.save()
        .catch(error => {
          throw new GraphQLError('Creating user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              invalidArgs: args.favoriteGenre,
              error
            }
          })
        })
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if ( !user || args.password !== 'secret' ) {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    }


    
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), process.env.JWT_SECRET
      )
      const currentUser = await User
        .findById(decodedToken.id)
      return { currentUser }
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})