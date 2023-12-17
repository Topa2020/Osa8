import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'
import { useState } from "react"

const Books = ({ show }) => {
  const [genreToSearch, setGenre] = useState('')
  const result = useQuery(ALL_BOOKS, {
    variables: { genreToSearch }
  })

  if (result.loading)  {
    return <div>loading...</div>
  }
  
  if (!show) {
      return null
    }

  const handleButton = (genre) => {
    if (genre === 'all genres') {
      setGenre('')
    } else {
        setGenre(genre)
      }     
    }
  
  const books = result.data.allBooks
    
  let genres = books.flatMap(book => book.genres)
  genres = [...new Set(genres)]
  genres.push('all genres')

  return (
    <div>
      <h2>books</h2>
      {genreToSearch &&
        <p>in genre {genreToSearch}</p>
      }
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <br />
        {genres.map((genre, index) => (
          <button key={index} onClick={() => handleButton(genre)}>
            {genre}
          </button>
        ))}
      </div>
    </div>
  )
}
  
export default Books