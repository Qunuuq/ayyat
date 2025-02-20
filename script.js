// توكن البوت ومعرف القناة (عدلها هنا)
const BOT_TOKEN = '6335197909:AAEVXGR2h3yNiThO3fwbBn_-AphOwnoItwE'; // مثل "123456:ABCDEF..."
const CHANNEL_ID = '-1002311002063'; // معرف القناة (رقمي) أو '@YourChannelName'

// جلب قائمة السور
async function fetchSurahs() {
    const response = await fetch('https://api.alquran.cloud/v1/surah');
    const data = await response.json();
    const surahSelect = document.getElementById('surah');
    
    data.data.forEach(surah => {
        const option = document.createElement('option');
        option.value = surah.number;
        option.textContent = `${surah.number} - ${surah.name}`;
        surahSelect.appendChild(option);
    });
}

// جلب الآيات وإظهارها
async function loadAyahs() {
    const surahNumber = document.getElementById('surah').value;
    if (!surahNumber) return;

    const ayatList = document.getElementById('ayatList');
    const loading = document.getElementById('loading');
    const sendButton = document.getElementById('sendToTelegram');
    
    ayatList.innerHTML = '';
    loading.style.display = 'block';
    sendButton.disabled = true;

    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar`);
    const data = await response.json();
    const audioResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.husary`);
    const audioData = await audioResponse.json();

    data.data.ayahs.forEach((ayah, index) => {
        const ayahElement = document.createElement('div');
        ayahElement.className = 'ayah';
        
        const header = document.createElement('div');
        header.className = 'ayah-header';
        header.textContent = `${data.data.name} - الآية ${ayah.numberInSurah}`;
        
        ayahElement.appendChild(header);
        ayahElement.innerHTML += `${ayah.text}`;
        ayahElement.dataset.audioUrl = audioData.data.ayahs[index].audio;
        ayahElement.dataset.surahName = data.data.name;
        ayahElement.dataset.verseNum = ayah.numberInSurah;
        ayatList.appendChild(ayahElement);
    });

    loading.style.display = 'none';
    sendButton.disabled = false;
}

// إرسال كل الآيات إلى تيليجرام
async function sendAllToTelegram() {
    const surahNumber = document.getElementById('surah').value;
    if (!surahNumber) return;

    const loading = document.getElementById('loading');
    loading.style.display = 'block';

    const ayahs = document.querySelectorAll('#ayatList .ayah');
    const botUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendAudio`;

    for (const ayah of ayahs) {
        const audioUrl = ayah.dataset.audioUrl;
        const surahName = ayah.dataset.surahName;
        const verseNum = ayah.dataset.verseNum;
        const ayahText = ayah.textContent.replace(`${surahName} - الآية ${verseNum}`, '').trim();

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

    loading.style.display = 'none';
    alert('تم إرسال الآيات إلى القناة بنجاح!');
}

// تحميل السور عند بدء التشغيل
fetchSurahs();
