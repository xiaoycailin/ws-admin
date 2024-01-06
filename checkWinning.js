const mysql = require('mysql');
const { Socket } = require('socket.io');
const Formula = require('./Formula')
const {default: axios} = require('axios')

const checkWinning = (db = mysql.createConnection(), io = Socket, socket = Socket, show_value = 10, resistance = 20, task, type) => {
    let sql
    // type = 'full'
    if (type == 'fast') {
        sql = `SELECT * FROM history WHERE status = 'Queue' AND type = 'place' AND place_type = '${type}' AND date BETWEEN DATE_SUB(NOW(), INTERVAL 2 HOUR) AND NOW()`
    } else {
        sql = `SELECT * FROM history WHERE status = 'Queue' AND type = 'place' AND place_type = '${type}' AND date BETWEEN DATE_SUB(NOW(), INTERVAL 24 HOUR) AND NOW()`
        // sql = `SELECT * FROM history WHERE status = 'Queue' AND type = 'place' AND place_type = '${type}'`
    }
    db.query(sql, (err, result) => {
        if (err) {
            io.emit('error', { message: err })
            return;
        }
        const dataParse = JSON.parse(JSON.stringify(result))
        // console.log(dataParse)
        // type = 'fast'
        db.query('SELECT * FROM multipliers WHERE type = ?', type, (e, res) => {
            const resp = JSON.parse(JSON.stringify(res))
            if (!e) {
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
                        io.emit('onData', { data })
                        const totalmember = data.result.data.tableOfWins.digit4_bb.total_member +
                            data.result.data.tableOfWins.digit4_fullbet.total_member +
                            data.result.data.tableOfWins.digit3_bl.total_member +
                            data.result.data.tableOfWins.digit3_dp.total_member +
                            data.result.data.tableOfWins.digit2_bl.total_member +
                            data.result.data.tableOfWins.digit2_dp.total_member
                        // console.log(totalmember)
                        db.query(`INSERT INTO results (number, type, resistance, total_place_bet, payout, total_data, total_member_win) VALUES ('${data.number}', '${type}', '${data.result.data.summary.resistance}', '${data.result.data.summary.totalAllPlaceBet}', '${data.result.data.summary.total_wins}', '${data.length}', '${totalmember}')`)

                        db.query(`UPDATE history SET status = 'Lose' WHERE type = 'place' AND place_type = '${type}' AND status = 'Queue' AND date BETWEEN DATE_SUB(NOW(), INTERVAL 24 HOUR) AND NOW()`)

                        // const memberwin
                        let memberWins = []
                        const tabWins = data.result.data.tableOfWins
                        for (const key in tabWins) {
                            if (tabWins.hasOwnProperty(key)) {
                                const obj = tabWins[key];
                                memberWins.push(...obj.members);
                            }
                        }
                        try {
                            axios.post('https://admin-jgr-pools.com/ajax/balance_update', JSON.stringify(memberWins), {headers: {
                                'X-REQUEST-FROM': 'nodejs',
                            }}).then(re => {
                                console.log(re.data)
                            })
                            io.emit('doneshow')
                        } catch (error) {
                        }
                    }
                })
                // for (let i = 0; i < show_value; i++) {
                //     if (i+1 == show_value){
                //     }
                // }
            }
        })
    })
}

module.exports = checkWinning