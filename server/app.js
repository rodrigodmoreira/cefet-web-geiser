// importação de dependência(s)
import { default as Express } from 'express'
import { default as Handlebars } from 'handlebars'
import { readFile } from 'fs'
import { exit } from 'process'


// variáveis globais deste módulo
const PORT = 3000
const db = {}
const app = Express()


// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 1-4 linhas de código (você deve usar o módulo de filesystem (fs))
readFile('server/data/jogadores.json', (err, data) => {
    if (err) {
        console.error(err)
        exit(1)
    }

    db.players = JSON.parse(data.toString()).players
})

readFile('server/data/jogosPorJogador.json', (err, data) => {
    if (err) {
        console.error(err)
        exit(1)
    }

    db.gamesPerPlayer = JSON.parse(data.toString())
})


// configurar qual templating engine usar. Sugestão: hbs (handlebars)
//app.set('view engine', '???qual-templating-engine???');
//app.set('views', '???caminho-ate-pasta???');
// dica: 2 linhas
app.set('view engine', 'hbs')
app.set('views', 'server/views')

// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json (~3 linhas)
app.get('/', (req, res) => {
    res.render('index', { players: db.players })
})

const deepCopy = obj => JSON.parse(JSON.stringify(obj))
app.get('/jogador/:id', (req, res) => {
    const { id } = req.params
    const player = db.players.find(p => p.steamid === id)
    if (!player) {
        res.status(404).send()
        return
    }
    
    const gamesFromPlayer = db.gamesPerPlayer[player.steamid]
    player.gamestop5 = deepCopy(gamesFromPlayer.games.sort((a, b) => b.playtime_forever - a.playtime_forever).slice(0, 5))
    player.gamesowned = gamesFromPlayer.game_count
    player.gamesnotplayed = gamesFromPlayer.games.filter(g => g.playtime_forever === 0).length

    for (const game of player.gamestop5) {
        game.playtime_forever = Math.floor(game.playtime_forever/60)
    }
    res.render('jogador', player)
})


// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter ~15 linhas de código


// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código
app.use(Express.static('client'))

// abrir servidor na porta 3000 (constante PORT)
// dica: 1-3 linhas de código
app.listen(PORT, () => {
    console.log(`Listening at port: ${PORT}`)
})
