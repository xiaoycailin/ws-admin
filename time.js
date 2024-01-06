const cronjobsTime = (cronTime = '50 0 * * *', update = (formattedDate) => {}) => {
    const cronDate = new Date();
    const currentHour = cronDate.getHours();
    const currentMinute = cronDate.getMinutes();
    let countdownMillis = getCronJobCountdownMillis(currentHour, currentMinute, cronTime);

    function getCronJobCountdownMillis(currentHour, currentMinute, cronTime) {
        const [cronMinute, cronHour] = cronTime.split(' ').map(Number);

        let countdownMillis = 0;

        if (currentHour < cronHour || (currentHour === cronHour && currentMinute <= cronMinute)) {
            // Jika cronjob masih pada hari yang sama
            const cronTimeMillis = cronHour * 60 * 60 * 1000 + cronMinute * 60 * 1000;
            const currentTimeMillis = currentHour * 60 * 60 * 1000 + currentMinute * 60 * 1000;
            countdownMillis = cronTimeMillis - currentTimeMillis;
        } else {
            // Jika cronjob sudah pada hari berikutnya
            const nextDayMillis = 24 * 60 * 60 * 1000; // 1 hari dalam milidetik
            const cronTimeMillis = cronHour * 60 * 60 * 1000 + cronMinute * 60 * 1000 + nextDayMillis;
            const currentTimeMillis = currentHour * 60 * 60 * 1000 + currentMinute * 60 * 1000;
            countdownMillis = cronTimeMillis - currentTimeMillis;
        }

        return countdownMillis;
    }

    // Fungsi untuk menampilkan countdown dan memanggil fungsi update
    function displayCountdown() {
        const countdownDate = new Date(countdownMillis);
        const formattedDate = countdownDate.toISOString().slice(0, 19).replace('T', ' '); // Format: 'YYYY-MM-DD HH:mm:ss'
        update(formattedDate);
        countdownMillis -= 1000;

        // Jika countdown sudah habis, hentikan interval
        if (countdownMillis < 0) {
            clearInterval(countdownInterval);
        }
    }

    // Tampilkan countdown setiap detik
    const countdownInterval = setInterval(displayCountdown, 1000);
    setTimeout(() => {
        clearInterval(countdownInterval);
    }, countdownMillis);
}


module.exports = cronjobsTime