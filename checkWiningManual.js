const mysql = require('mysql');
const { Socket } = require('socket.io');
const Formula = require('./Formula')

const checkWiningManual = (db = mysql.createConnection(), io = Socket, show_value = 10, resistance = 20, type) => {
    let sql
    // type = 'full'
    if (type == 'fast') {
        sql = `SELECT * FROM history WHERE status = 'Queue' AND type = 'place' AND place_type = '${type}' AND date BETWEEN DATE_SUB(NOW(), INTERVAL 2 HOUR) AND NOW()`
    } else {
        // sql = `SELECT * FROM history WHERE status = 'Queue' AND type = 'place' AND place_type = '${type}' AND date BETWEEN DATE_SUB(NOW(), INTERVAL 24 HOUR) AND NOW()`
        sql = `SELECT * FROM history WHERE status = 'Queue' AND type = 'place' AND place_type = '${type}'`
    }
    db.query(sql, (err, result) => {
        if (err) {
            io.emit('error', { message: err })
            return;
        }
        const dataParse = JSON.parse(JSON.stringify(result))
        db.query('SELECT * FROM multipliers WHERE type = ?', type, (e, res) => {
            const resp = JSON.parse(JSON.stringify(res))
            if (!e) {
                for (let i = 0; i < show_value; i++) {
                    Formula.run({
                        datas: dataParse,
                        isFastnumber: type == 'fast' ? true : false,
                        resistance: resistance,
                        multipliers: {
                            fastNumber: {
                                d2: resp[0].d2,
                                d3: resp[0].d3,
                                d4: resp[0].d4,
                            },
                            fullBet: {
                                d2: resp[0].d2,
                                d3: resp[0].d3,
                                d4: resp[0].d4,
                            }
                        },
                        onSuccess: (data) => {
                            io.emit('onData', { data, show_value })
                        }
                    })
                }
            }
        })
    })
}

module.exports = checkWiningManual