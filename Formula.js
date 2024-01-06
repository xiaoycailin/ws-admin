class Formula {
    static formatRupiah(number) {
        const formattedNumber = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(number)
        return formattedNumber
    }
    static randomNumber() {
        const uniqueDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
        let randomNumber = ''
        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
        shuffleArray(uniqueDigits)
        const firstTwoDigits = uniqueDigits.slice(0, 2)
        randomNumber = firstTwoDigits.join('')
        randomNumber += (Math.floor(Math.random() * 99) + 1).toString().padStart(2, '0')
        return randomNumber
    }

    static calculatePayout(datas = [], input = 0, resistance = 0, isFastnumber = false, multipliers = {
        fastNumber: {
            d2: 50,
            d3: 200,
            d4: 2000,
        },
        fullBet: {
            d2: 150,
            d3: 950,
            d4: 9000
        }
    }) {
        let totalAllPlaceBet = 0

        // digit2
        let total_digit2_dp = 0
        let total_digit2_bl = 0
        let number_digit2_dp = 0
        let number_digit2_bl = 0
        let total_place_bet_2d_dp = 0
        let total_place_bet_2d_bl = 0
        let members_2d_dp = []
        let members_2d_bl = []
        
        // digit3
        let total_digit3_dp = 0
        let total_digit3_bl = 0
        let number_digit3_dp = 0
        let number_digit3_bl = 0
        let total_place_bet_3d_dp = 0
        let total_place_bet_3d_bl = 0
        let members_3d_dp = []
        let members_3d_bl = []
        
        // digit4
        let total_digit4_bb = 0
        let total_digit4_fullbet = 0
        let number_digit4_bb = 0
        let number_digit4_fullbet = 0
        let total_place_bet_4d_bb = 0
        let total_place_bet_4d_fullbet = 0
        let members_4d_bb = []
        let members_4d_fullbet = []

        datas.forEach(data => {
            const splitInput = this.splitterNumber(input)
            totalAllPlaceBet += parseInt(data.amount)
            // digit 2
            const dataNumber = `${data.place_number}`

            if (dataNumber == splitInput.digit2.DP && data.bet_type == '2D DP') {
                total_digit2_dp++
                number_digit2_dp = splitInput.digit2.DP
                total_place_bet_2d_dp += parseInt(data.amount)
                members_2d_dp.push(data)
            }
            if (dataNumber == splitInput.digit2.BL && data.bet_type == '2D BL') {
                total_digit2_bl++
                number_digit2_bl = splitInput.digit2.BL
                total_place_bet_2d_bl += parseInt(data.amount)
                members_2d_bl.push(data)
            }
            // end digit 2
            
            // digit 3
            if (dataNumber == splitInput.digit3.DP && data.bet_type == '3D DP') {
                total_digit3_dp++
                number_digit3_dp = splitInput.digit3.DP
                total_place_bet_3d_dp += parseInt(data.amount)
                members_3d_dp.push(data)
            }
            if (dataNumber == splitInput.digit3.BL && data.bet_type == '3D BL') {
                total_digit3_bl++
                number_digit3_bl = splitInput.digit3.BL
                total_place_bet_3d_bl += parseInt(data.amount)
                members_3d_bl.push(data)
            }
            // end digit 3
            
            // digit 4
            if (dataNumber == splitInput.digit4.BB && data.bet_type == '4D BB') {
                total_digit4_bb++
                number_digit4_bb = splitInput.digit4.BB
                total_place_bet_4d_bb += parseInt(data.amount)
                members_4d_bb.push(data)
            }
            
            if (dataNumber == splitInput.digit4.FULLBET && data.bet_type == '4D FULLBET') {
                total_digit4_fullbet++
                number_digit4_fullbet = splitInput.digit4.FULLBET
                total_place_bet_4d_fullbet += parseInt(data.amount)
                members_4d_fullbet.push(data)
            }
            // end digit 4
        })

        // TODO: next step search member by number of wins and by type
        const tableOfWins = {
            digit2_dp: {
                total_member: total_digit2_dp,
                total_place_bet: total_place_bet_2d_dp,
                number: number_digit2_dp,
                total_win: total_place_bet_2d_dp * (!isFastnumber ? multipliers.fullBet.d2 : multipliers.fastNumber.d2),
                members: members_2d_dp
            },
            digit2_bl: {
                total_member: total_digit2_bl,
                total_place_bet: total_place_bet_2d_bl,
                number: number_digit2_bl,
                total_win: total_place_bet_2d_bl * (!isFastnumber ? multipliers.fullBet.d2 : multipliers.fastNumber.d2),
                members: members_2d_bl
            },
            digit3_dp: {
                total_member: total_digit3_dp,
                total_place_bet: total_place_bet_3d_dp,
                number: number_digit3_dp,
                total_win: total_place_bet_3d_dp * (!isFastnumber ? multipliers.fullBet.d3 : multipliers.fastNumber.d3),
                members: members_3d_dp
            },
            digit3_bl: {
                total_member: total_digit3_bl,
                total_place_bet: total_place_bet_3d_bl,
                number: number_digit3_bl,
                total_win: total_place_bet_3d_bl * (!isFastnumber ? multipliers.fullBet.d3 : multipliers.fastNumber.d3),
                members: members_3d_bl
            },
            digit4_bb: {
                total_member: total_digit4_bb,
                total_place_bet: total_place_bet_4d_bb,
                number: number_digit4_bb,
                total_win: total_place_bet_4d_bb * (!isFastnumber ? multipliers.fullBet.d4 : multipliers.fastNumber.d4),
                members: members_4d_bb
            },
            digit4_fullbet: {
                total_member: total_digit4_fullbet,
                total_place_bet: total_place_bet_4d_fullbet,
                number: number_digit4_fullbet,
                total_win: total_place_bet_4d_fullbet * (!isFastnumber ?multipliers.fullBet.d4 : multipliers.fastNumber.d4),
                members: members_4d_fullbet
            },
        }
        const summary = {
            total_wins: tableOfWins.digit2_bl.total_win + tableOfWins.digit2_dp.total_win + tableOfWins.digit3_bl.total_win + tableOfWins.digit3_dp.total_win + tableOfWins.digit4_bb.total_win + tableOfWins.digit4_fullbet.total_win,
            resistance: totalAllPlaceBet * resistance / 100,
            totalAllPlaceBet,
        }
        if (summary.total_wins > summary.resistance) {
            return {
                status: 'OVER',
                data: { summary, tableOfWins }
            }
        } else {
            return {
                status: 'GOOD',
                data: { summary, tableOfWins }
            }
        }
    }

    static splitterNumber(number = '0000') {
        number = number.toString()
        const digit2 = {
            DP: number.substring(0, 2),
            BL: number.substring(2, 4)
        }

        const digit3 = {
            DP: number.substring(0, 3),
            BL: number.substring(1, 4)
        }

        const digit4 = {
            BB: number,
            FULLBET: number,
        }
        return { digit2, digit3, digit4 }
    }

    static run({
        datas,
        resistance,
        isFastnumber = false,
        onSuccess = ({result, number, length = 0}) => {},
        multipliers = {
            fastNumber: {
                d2: 50,
                d3: 200,
                d4: 2000,
            },
            fullBet: {
                d2: 150,
                d3: 950,
                d4: 9000
            }
        }
    }) {
        const intervalID = setInterval(() => {
            const random = Formula.randomNumber()
            const res = Formula.calculatePayout(datas, random, resistance, isFastnumber, multipliers)
            if (res.status == 'GOOD') {
                clearInterval(intervalID)
                onSuccess({result: res, number: random, length: datas.length})
            }
        }, 0)
    }
}

module.exports = Formula