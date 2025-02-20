// توكن البوت ومعرف القناة (عدلها هنا)
const BOT_TOKEN = '6335197909:AAEVXGR2h3yNiThO3fwbBn_-AphOwnoItwE'; // مثل "123456:ABCDEF..."
const CHANNEL_ID = '-1002273356001'; // معرف القناة (رقمي) أو '@YourChannelName'

// جلب قائمة السور
async function fetchSurahs() {
    const response = await fetch('https://api.alquran.cloud/v1/surah');
    const data = await response.json();
    return data.data;
}

// جلب الآيات وإرسالها إلى تيليجرام
async function loadAndSendAyahs() {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';

    const surahs = await fetchSurahs();
    const botUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendAudio`;

    for (const surah of surahs) {
        const surahNumber = surah.number;
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar`);
        const data = await response.json();
        const audioResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.husary`);
        const audioData = await audioResponse.json();

        for (const ayah of data.data.ayahs) {
            const audioUrl = audioData.data.ayahs[ayah.numberInSurah - 1].audio;
            const surahName = data.data.name;
            const verseNum = ayah.numberInSurah;
            const ayahText = ayah.text;

            try {
                const audioResponse = await fetch(audioUrl);
                const audioBlob = await audioResponse.blob();
                const formData = new FormData();
                formData.append('chat_id', CHANNEL_ID);
                formData.append('audio', audioBlob, 'ayah_audio.mp3');
                formData.append('caption', `سورة ${surahName} - الآية ${verseNum}\n\n${ayahText}`);

                const telegramResponse = await fetch(botUrl, {
                    method: 'POST',
                    body: formData
                });

                if (!telegramResponse.ok) {
                    throw new Error('خطأ في الإرسال إلى تيليجرام');
                }
            } catch (error) {
                alert(`خطأ أثناء إرسال الآية: ${error.message}`);
                break;
            }
        }
    }

    loading.style.display = 'none';
    alert('تم إرسال جميع الآيات إلى القناة بنجاح!');
}

// بدء عملية الإرسال تلقائيًا
loadAndSendAyahs();
