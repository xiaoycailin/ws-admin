const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cron = require('node-cron')
const cors = require('cors')
const mysql = require('mysql')
const checkWinning = require('./checkWinning')
const checkWiningManual = require('./checkWiningManual')
const { default: axios } = require('axios')

const db = mysql.createConnection({
    host: 'localhost',
    user: 'adminpoke_jgr_pools_u',
    password: 'Aiden2209#',
    database: 'adminpoke_jgr_pools'
})
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err)
        return
    }
    console.log('Connected to MySQL')
})

const app = express()
const server = http.createServer(app)
app.use(cors())

const io = socketIo(server, {
    cors: {
        origin: "https://admin-jgr-pools.com", // Sesuaikan dengan alamat aplikasi Anda
        methods: ["GET", "POST"]
    }
})

app.get('/', (req, res) => {
    res.status(403)
    res.json({success:false, message: 'Forbiden'})
})

let taskFast
let taskFull
// Mengatur koneksi socket.io
io.on('connection', (socket) => {
    socket.on('checktaskfast', () => {
        if (!taskFast) return io.emit('taskstatusfast', { task: false })
        io.emit('taskstatusfast', { task: true })
    })
    socket.on('checktaskfull', () => {
        if (!taskFull) return io.emit('taskstatusfull', { task: false })
        io.emit('taskstatusfull', { task: true })
    })

    socket.on('get_config', (type) => {
        db.query('SELECT * FROM config WHERE type = ?', type, (error, result) => {
            io.emit('config_data', result[0])
        })
    })
    socket.on('save_config', (data) => {
        const updateData = {
            delay_after_show: data.delay,
            resistance: data.resistance,
            show_value: data.show_value
        }
        db.query('UPDATE config SET ? WHERE type = ?', [updateData, data.type], (error, result, fields) => {

            io.emit('callback_db', { message: 'Data config is successfully Updated...' })
        })
    })

    // updatemanualy
    socket.on('updatedata', (data) => {
        const totalmember = data.result.data.tableOfWins.digit4_bb.total_member +
            data.result.data.tableOfWins.digit4_fullbet.total_member +
            data.result.data.tableOfWins.digit3_bl.total_member +
            data.result.data.tableOfWins.digit3_dp.total_member +
            data.result.data.tableOfWins.digit2_bl.total_member +
            data.result.data.tableOfWins.digit2_dp.total_member
        db.query(`INSERT INTO results (number, type, resistance, total_place_bet, payout, total_data, total_member_win) VALUES ('${data.number}', '${data.type}', '${data.result.data.summary.resistance}', '${data.result.data.summary.totalAllPlaceBet}', '${data.result.data.summary.total_wins}', '${data.length}', '${totalmember}')`)
        
        axios.get('https://admin-jgr-pools.com/update.php?type='+data.type).then(upd => {
            console.log(upd)
        }).catch(errs => {
            console.log(errs)
        })
        
        let memberWins = []
        const tabWins = data.result.data.tableOfWins
        for (const key in tabWins) {
            if (tabWins.hasOwnProperty(key)) {
                const obj = tabWins[key];
                memberWins.push(...obj.members)
            }
        }
        console.log(memberWins)
        axios.post('https://admin-jgr-pools.com/requests/balance_update', JSON.stringify(memberWins), {headers: {
            'X-REQUEST-FROM': 'nodejs',
        }}).then(re => {
            console.log(re.data)
            io.emit('doneupdate', re.data)
            io.emit('doneupdate', memberWins)
            io.emit('sip')
        }).catch(error => {
            console.log(error)
        })
    })

    // checkManualy
    socket.on('checkmanual', (type) => {
        db.query('SELECT * FROM config WHERE type = ?', type, (error, result) => {
            if (result) {
                checkWiningManual(db, io, result[0].show_value, result[0].resistance, type)
            }
        })
    })

    // menjalankan task
    socket.on('startTask', (type) => {
        if (type == 'fast') {
            if (!taskFast) {
                db.query('SELECT * FROM config WHERE type = ?', type, (error, result) => {
                    if (result) {
                        taskFast = cron.schedule(result[0].delay_after_show, () => {
                            checkWinning(db, io, socket, result[0].show_value, result[0].resistance, taskFast, type)
                        })
                        taskFast.start()
                        io.emit('taskstatusfast', { task: true, message: result[0].delay_after_show })
                    }
                })
            } else {
                io.emit('taskstatusfast', { task: true })
            }
        } else {
            if (!taskFull) {
                db.query('SELECT * FROM config WHERE type = ?', type, (error, result) => {
                    if (result) {
                        taskFull = cron.schedule(result[0].delay_after_show, () => {
                            checkWinning(db, io, socket, result[0].show_value, result[0].resistance, taskFull, type)
                        })
                        taskFull.start()
                        io.emit('taskstatusfull', { task: true, message: result[0].delay_after_show })
                    }
                })
            } else {
                io.emit('taskstatusfull', { task: true })
            }
        }

    })
    socket.on('stopTask', (type) => {
        if (type == 'fast') {
            if (taskFast) {
                taskFast.stop()
                taskFast = null
                io.emit('taskstatusfast', { task: false })
            } else {
                io.emit('taskstatusfast', { task: false })
            }
        } else {
            if (taskFull) {
                taskFull.stop()
                taskFull = null
                io.emit('taskstatusfull', { task: false })
            } else {
                io.emit('taskstatusfull', { task: false })
            }
        }
    })
})

const port = 3000
server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})


