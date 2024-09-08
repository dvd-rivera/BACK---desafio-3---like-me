const express = require('express')
const app = express()
const cors = require('cors')
const { Pool } = require('pg')

app.listen(3000, console.log('¡Servidor encendido!'))

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'Clave_SQL',
    database: 'likeme',
    allowExitOnIdle: true,
})

const getPosts = async () => {
    try {
        const result = await pool.query('SELECT * FROM posts ORDER BY id ASC;')
        return result.rows
    } catch (error) {
        console.error('Error al obtener los posts:', error)
        throw error
    }
}

app.get('/posts', async (req, res) => {
    try {
        const posts = await getPosts()
        res.json(posts)
    } catch (error) {
        res.status(500).send('Error al cargar la lista de Posts')
    }
})

const addPost = async (titulo, url, descripcion) => {
    try {
        const result = await pool.query(
            'INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, $4)',
            [titulo, url, descripcion, 0]
        )
        return result
    } catch (error) {
        console.error('Error al agregar el post:', error)
        throw error
    }
}

app.post('/posts', async (req, res) => {
    const { titulo, url, descripcion } = req.body
    try {
        await addPost(titulo, url, descripcion)
        res.send('Post agregado correctamente')
    } catch (error) {
        res.status(500).send('Error al agregar el post')
    }
})

const addLike = async (id) => {
    try {
        const result = await pool.query(
            'UPDATE posts SET likes = likes + 1 WHERE id = $1',
            [id]
        )
        return result
    } catch (error) {
        console.error('Error al actualizar los likes:', error)
        throw error
    }
}

app.put('/posts/like/:id', async (req, res) => {
    const { id } = req.params
    try {
        await addLike(id)
        res.send('Like actualizado correctamente')
    } catch (error) {
        res.status(500).send('Error al actualizar el like')
    }
})

const deletePost = async (id) => {
    try {
        const result = await pool.query('DELETE FROM posts WHERE id = $1', [id])
        return result
    } catch (error) {
        console.error('Error al eliminar el post:', error)
        throw error
    }
}

app.delete('/posts/:id', async (req, res) => {
    const { id } = req.params
    try {
        await deletePost(id)
        res.send('Post eliminado correctamente')
    } catch (error) {
        res.status(500).send('Error al eliminar el post')
    }
})
