import { useState } from 'react'
import Select from 'react-select'
import { useMutation } from '@apollo/client'
import { UPDATE_AUTHOR } from '../queries'

const Authors = ({ show, authors }) => {
  const [selectedOption, setSelectedOption] = useState(null)
  const [born, setBirthyear] = useState('')

  const [ updateAuthor ] = useMutation(UPDATE_AUTHOR)

  const options = authors.map((a) => ({value: a.name, label: a.name}))

  const submit = async (event) => {
    event.preventDefault()
    
    const name = selectedOption.value
    if(Number.isInteger(born)) {
      updateAuthor({ variables: { name, born }})
    } 
    setBirthyear('')
    setSelectedOption(null)
  }
  
  if (!show) {
      return null
    }
  
    return (
      <div>
        <h2>authors</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>born</th>
              <th>books</th>
            </tr>
            {authors.map((a) => (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Set birthyear</h3>
        <form onSubmit={submit}>
        <div>
          <Select
            value={selectedOption}
            onChange={setSelectedOption}
            options={options}
          />
        </div>
        <div>
          born <input value={born}
            onChange={({ target }) => setBirthyear(Number(target.value))}
          />
        </div>
        
        <button type='submit'>update author</button>
      </form>
      </div>
    )
  }
  
  export default Authors