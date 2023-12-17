import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'

const Recommended = ({ show, favourite} ) => {

  const genreToSearch = favourite

  const result = useQuery(ALL_BOOKS, {
    variables: { genreToSearch }
  })

  if (result.loading)  {
    return <div>loading...</div>
  }
    
  if (!show) {
    return null
  }

  const books = result.data.allBooks
  
  return (
    <div>
      <h2>recommendations</h2>

      <p>books in your favorite genre <b>{genreToSearch}</b></p>
        
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
       
    </div>
  )
}
  
  export default Recommended