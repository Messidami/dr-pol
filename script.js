const EMAILJS_CONFIG = {
    serviceId: 'service_u8rd9ph',
    userTemplateId: 'template_kbtm2qb',
    adminTemplateId: 'template_dptrbre',
    publicKey: '7-qERvc4PdJNp_87I'
};

if (window.emailjs && EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(EMAILJS_CONFIG.publicKey);
}

const DOCTORS = [
    { id: 'dr-pol', name: 'Dr. Jan Pol', specialty: 'Veterinarian, General Practice & Family Medicine', image: 'https://www.cheatsheet.com/wp-content/uploads/2019/12/GettyImages-461145024.jpg', baseVotes: 120 },
    { id: 'dr-brenda', name: 'Dr. Brenda Grettenberger', specialty: 'Veterinarian, Large Animal Specialist', image: 'https://alaskashows.com/wp-content/uploads/2020/07/Dr.Brenda-profession-300x222.jpg', baseVotes: 130 },
    { id: 'dr-nicole', name: 'Dr. Nicole Arcy', specialty: 'Veterinarian, Mixed Animal Practice', image: 'https://hsnaples.org/wp-content/uploads/Natalie-Brown-1-2048x2048.jpeg', baseVotes: 125 },
    { id: 'dr-lisa', name: 'Dr. Lisa Jones', specialty: 'Veterinarian, Mixed Animal Practice', image: 'https://i.pinimg.com/736x/32/1c/16/321c1658f4f3b71dfc6ab666de6417a1.jpg', baseVotes: 115 },
    { id: 'charles-pol', name: 'Charles Pol', specialty: 'Practice Manager, Producer (Dr. Pol’s son)', image: 'https://th.bing.com/th/id/R.50df125e3039d909e13bdfe21ac24778?rik=asojHYMJ8t17Sg&pid=ImgRaw&r=0', baseVotes: 90 },
    { id: 'kathy-pol', name: 'Kathy Pol', specialty: 'Office Staff / Receptionist (Dr. Pol’s daughter)', image: 'https://tse4.mm.bing.net/th/id/OIP.MNqsoDz1GLF7tP2iTq2YAAHaGi?rs=1&pid=ImgDetMain&o=7&rm=3', baseVotes: 80 },
    { id: 'beth-pol', name: 'Beth Pol', specialty: 'Veterinary Assistant (Charles’ wife)', image: 'https://m.media-amazon.com/images/M/MV5BOWNhYjg1ZjUtNzc2Mi00YWM4LThlYWEtMmI5NDFmYzgxZTljXkEyXkFqcGc@._V1_.jpg', baseVotes: 75 },
    { id: 'diane-jr-pol', name: 'Diane Jr. Pol', specialty: 'Occasional Family/Practice Assistant', image: 'https://i.pinimg.com/originals/75/bb/97/75bb97b1d4cd2423c9fc44b27fda7f48.jpg', baseVotes: 70 },
    { id: 'andrea-mata', name: 'Andrea (Vet Tech)', specialty: 'Veterinary Technician', image: 'https://tse3.mm.bing.net/th/id/OIP.Rz59aWq673Y2rKfaottPhgHaLG?rs=1&pid=ImgDetMain&o=7&rm=3', baseVotes: 95 },
    { id: 'monica', name: 'Monica Austin', specialty: 'Long-time Veterinary Assistant (surgeries & farm calls)', image: 'https://www.dukehealth.org/sites/default/files/styles/doctor_profile/public/physician/monica-austin-pt-dpt-ocs.jpg?itok=qI1vNEao', baseVotes: 100 }
];

let selectedDoctor = null;
const VOTES_KEY = 'doctor_votes';
const VOTED_EMAILS_KEY = 'voted_emails';

function getVotes() {
    const stored = localStorage.getItem(VOTES_KEY);
    return stored ? JSON.parse(stored) : {};
}

function saveVotes(votes) {
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}

function getVotedEmails() {
    const stored = localStorage.getItem(VOTED_EMAILS_KEY);
    return stored ? JSON.parse(stored) : [];
}

function hasVoted(email) {
    const votedEmails = getVotedEmails();
    return votedEmails.includes(email.toLowerCase());
}

function recordVote(email, doctorId) {
    if (hasVoted(email)) return false;
    const votedEmails = getVotedEmails();
    votedEmails.push(email.toLowerCase());
    localStorage.setItem(VOTED_EMAILS_KEY, JSON.stringify(votedEmails));
    const votes = getVotes();
    votes[doctorId] = (votes[doctorId] || 0) + 1;
    saveVotes(votes);
    return true;
}

function getVoteCount(doctorId) {
    const votes = getVotes();
    const doctor = DOCTORS.find(d => d.id === doctorId);
    return (votes[doctorId] || 0) + (doctor?.baseVotes || 0);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.className = `toast active ${type}`;
    setTimeout(() => toast.classList.remove('active'), 4000);
}

function openVoteModal(doctor) {
    selectedDoctor = doctor;
    const modal = document.getElementById('voteModal');
    const modalTitle = document.getElementById('modalTitle');
    modalTitle.textContent = `Vote for ${doctor.name}`;
    modal.classList.add('active');
}

function closeVoteModal() {
    const modal = document.getElementById('voteModal');
    modal.classList.remove('active');
    selectedDoctor = null;
    document.getElementById('voteForm').reset();
}

function handleChatClick(doctor) {
    if (window.Tawk_API) {
        window.Tawk_API.maximize();

        window.Tawk_API.setAttributes({
            doctorName: doctor.name,
            doctorSpecialty: doctor.specialty
        }, function (error) {
            if (error) console.error("Tawk.to setAttributes error:", error);
        });

        window.Tawk_API.addEvent('chat_with_doctor', {
            message: `Hello! You are now chatting with ${doctor.name}.`
        });

    } else {
        showToast('Chat is loading. Please try again in a moment.', 'error');
    }
}

async function sendVoteConfirmation(data) {
    if (!window.emailjs || EMAILJS_CONFIG.serviceId === 'YOUR_SERVICE_ID') return;
    try {
        await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.userTemplateId,
            {
                to_email: data.userEmail,
                to_name: data.userName,
                doctor_name: data.doctorName,
                doctor_specialty: data.doctorSpecialty
            }
        );
        await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.adminTemplateId,
            {
                user_email: data.userEmail,
                user_name: data.userName,
                doctor_name: data.doctorName,
                doctor_specialty: data.doctorSpecialty
            }
        );
    } catch (error) {
        console.error('Error sending emails:', error);
    }
}

document.getElementById('voteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userName = document.getElementById('userName').value;
    const userEmail = document.getElementById('userEmail').value;
    const submitBtn = document.getElementById('submitBtn');
    if (!userName || !userEmail || !selectedDoctor) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    if (hasVoted(userEmail)) {
        showToast('You have already voted! Each email can only vote once.', 'error');
        closeVoteModal();
        return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    try {
        const success = recordVote(userEmail, selectedDoctor.id);
        if (!success) {
            showToast('You have already voted with this email!', 'error');
            closeVoteModal();
            return;
        }
        await sendVoteConfirmation({
            userEmail,
            userName,
            doctorName: selectedDoctor.name,
            doctorSpecialty: selectedDoctor.specialty
        });
        showToast('Vote successful! Check your email for confirmation.', 'success');
        closeVoteModal();
        renderDoctors();
    } catch (error) {
        showToast('Vote recorded but email notification failed.', 'error');
        renderDoctors();
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Vote';
    }
});

function renderDoctors() {
    const grid = document.getElementById('doctorsGrid');
    grid.innerHTML = '';
    DOCTORS.forEach(doctor => {
        const voteCount = getVoteCount(doctor.id);
        const card = document.createElement('div');
        card.className = 'doctor-card';
        card.innerHTML = `
            <img src="${doctor.image}" alt="${doctor.name}" class="doctor-image">
            <div class="doctor-info">
                <h3 class="doctor-name">${doctor.name}</h3>
                <p class="doctor-specialty">${doctor.specialty}</p>
                <div class="vote-count">
                    <span>❤️</span>
                    <span>${voteCount} ${voteCount === 1 ? 'Vote' : 'Votes'}</span>
                </div>
                <div class="buttons">
                    <button class="btn btn-primary" onclick='openVoteModal(${JSON.stringify(doctor)})'>Vote</button>
                    <button class="btn btn-secondary" onclick='handleChatClick(${JSON.stringify(doctor)})'>Chat with ${doctor.name}</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

document.getElementById('voteModal').addEventListener('click', (e) => {
    if (e.target.id === 'voteModal') closeVoteModal();
});

document.addEventListener('DOMContentLoaded', () => {
    renderDoctors();
});
