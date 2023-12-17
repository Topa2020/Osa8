import { useState, useEffect } from "react"
import Authors from "./components/Authors"
import Books from "./components/Books"
import NewBook from "./components/NewBook"
import Recommended from "./components/Recommended"
import LoginForm from "./components/LoginForm"
import { ALL_AUTHORS } from './queries'
import { useQuery, useApolloClient } from '@apollo/client'
import { USER } from './queries'

const App = () => {
  const [page, setPage] = useState("authors")
  const [token, setToken] = useState(null)
  const [user, setUser] = useState('')
  const [favourite, setFavourite] = useState('')

  const client = useApolloClient()

  const result = useQuery(ALL_AUTHORS)

  const fav = useQuery(USER)

  useEffect(() => {
    setToken(localStorage.getItem('library-user-token', token))
    if(fav.data !== undefined && fav.data.me) {
      setFavourite(fav.data.me.favoriteGenre)
    }  
  }, [result])

  if (result.loading)  {
    return <div>loading...</div>
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.clear()
    client.resetStore()
    setPage('authors')
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token &&
        <button onClick={() => setPage("add")}>add book</button>
        }
        {token &&
          <button onClick={() => setPage("recommended")}>recommended</button>
        }
        {!token &&
          <button onClick={() => setPage("login")}>login</button>
        }
        {token &&
          <button onClick={logout}>logout</button>
        }
      </div>

      <Authors show={page === "authors"} authors={result.data.allAuthors} token={token} />
      <Books show={page === "books"} />
      {token &&
      <Recommended user={user} show={page === "recommended"} favourite={favourite} token={token} />
      }
      <NewBook show={page === "add"} setPage={setPage} />
      {!token &&  
        <LoginForm show={page === "login"} setToken={setToken} setPage={setPage} />
      }
    </div>
  )
}

export default App
