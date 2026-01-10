/* --- CONFIGURATION & CONSTANTES --- */
const API_URL = "https://mafiabackend.onrender.com"; // Ton URL Render

/* --- INITIALISATION AU CHARGEMENT --- */
window.onload = () => {
    const saved = localStorage.getItem('nine-theme') || 'dark';
    const themeSelect = document.getElementById('themeChoice');
    if(themeSelect) themeSelect.value = saved;
    
    // Application du thème sauvegardé
    applyThemeLogic(saved);
    
    setTimeout(() => { 
        showAnnouncement("Offre limitée : -20% sur la Mafia Night !", "fa-fire"); 
    }, 300);
};

/* --- GESTION DES THÈMES & AFFICHAGE --- */
function applyThemeLogic(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if(theme === 'animated') {
        document.body.style.animation = "gradientBG 10s ease infinite";
        document.body.style.background = "linear-gradient(-45deg, #0b0e14, #1a0525, #051625, #0b0e14)";
        document.body.style.backgroundSize = "400% 400%";
    } else {
        document.body.style.animation = "none"; 
        document.body.style.background = "var(--bg)";
    }
}

function changeTheme() {
    const theme = document.getElementById('themeChoice').value;
    applyThemeLogic(theme);
    localStorage.setItem('nine-theme', theme);
}

function changeThemeFromMenu() {
    const theme = document.getElementById('themeChoiceMenu').value;
    applyThemeLogic(theme);
    localStorage.setItem('nine-theme', theme);
}

/* --- NAVIGATION & SIDEBAR --- */
function toggleSidebar(open) {
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (open) {
        menu.style.right = "0";
        overlay.style.display = "block";
        document.body.style.overflow = "hidden"; 
    } else {
        menu.style.right = "-110%"; 
        overlay.style.display = "none";
        document.body.style.overflow = "auto"; 
    }
}

function openTicketSearchFromMenu() {
    toggleSidebar(false); 
    toggleTicketSearch(true); 
}

/* --- RECHERCHE DE TICKET PAR ID --- */
function toggleTicketSearch(show) {
    const mainContent = document.getElementById('eventsGrid');
    const title = document.getElementById('resultCount');
    const searchPage = document.getElementById('ticketSearchPage');

    if (show) {
        mainContent.style.display = 'none';
        title.style.display = 'none';
        searchPage.style.display = 'block';
    } else {
        mainContent.style.display = 'grid';
        title.style.display = 'block';
        searchPage.style.display = 'none';
        document.getElementById('searchResultArea').innerHTML = ""; 
    }
}

async function findMyTicket() {
    const ticketId = document.getElementById('searchTicketID').value.trim().toUpperCase();
    const resultArea = document.getElementById('searchResultArea');

    if (!ticketId) return alert("Veuillez entrer un ID.");

    try {
        const response = await fetch(`${API_URL}/ticket-status/${ticketId}`);
        const data = await response.json();

        if (data.success) {
            const t = data.ticket;
            const paye = parseFloat(t.montant_paye);
            const total = parseFloat(t.prix_total);
            const pourcentage = (paye / total) * 100;

            resultArea.innerHTML = `
                <div style="margin-top:20px; padding:20px; border-top:1px solid rgba(255,255,255,0.1); text-align:left;">
                    <h4 style="color:var(--secondary); margin-bottom:5px;">${t.event_name}</h4>
                    <p style="font-size:0.8rem;">Client : ${t.telephone_client}</p>
                    
                    <div style="width:100%; background:rgba(255,255,255,0.1); height:12px; border-radius:10px; margin:15px 0; overflow:hidden;">
                        <div style="width: ${pourcentage}%; height:100%; background:var(--gradient);"></div>
                    </div>
                    <p style="font-size:0.9rem;">Payé : ${paye.toFixed(2)}Fcfa / ${total.toFixed(2)}Fcfa</p>
                    
                    ${pourcentage < 100 ? `
                        <div style="display:flex; gap:10px; margin-top:15px;">
                            <input type="number" id="extraPay" placeholder="Somme" style="width:80px; padding:8px; border-radius:8px; border:none; background:#000; color:#fff;">
                            <button onclick="payFromSearch('${t.ticket_id_public}')" style="background:var(--secondary); color:black; border:none; padding:8px 15px; border-radius:8px; font-weight:700; cursor:pointer; flex-grow:1;">COMPLÉTER LE PAIEMENT</button>
                        </div>
                    ` : '<h3 style="color:var(--secondary); text-align:center;">✅ TICKET PAYÉ</h3>'}
                </div>
            `;
        } else {
            resultArea.innerHTML = `<p style="color:#ff4d4d; margin-top:20px;">Ticket introuvable. Vérifiez l'ID.</p>`;
        }
    } catch (e) {
        alert("Erreur serveur.");
    }
}

async function payFromSearch(id) {
    const amount = document.getElementById('extraPay').value;
    if (!amount || amount <= 0) return;

    try {
        const response = await fetch(`${API_URL}/pay-partial`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket_id_public: id, montant: amount })
        });
        const data = await response.json();
        if (data.success) {
            alert("Paiement validé !");
            findMyTicket(); 
        }
    } catch (e) { alert("Erreur."); }
}

/* --- AUTHENTIFICATION & COMPTE --- */
function toggleAuthPage(show) {
    const authPage = document.getElementById('authPage');
    if (authPage) {
        authPage.style.display = show ? 'flex' : 'none';
        document.body.style.overflow = show ? 'hidden' : 'auto';
    }
}

function showAuth() {
    const modal = document.getElementById('authModal');
    if(modal) modal.style.display = 'flex';
}

function closeAuth() {
    const modal = document.getElementById('authModal');
    if(modal) modal.style.display = 'none';
}

async function registerUser() {
    const phone = document.getElementById('userPhone').value;
    const email = document.getElementById('userEmail').value;
    const address = document.getElementById('userAddress').value;

    if (!phone || !address) {
        alert("Le téléphone et l'adresse sont obligatoires !");
        return;
    }

    try {
        const response = await fetch('https://TON-LIEN-RENDER.com/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                telephone: phone,
                adresse: address,
                password: "123",
                username: "Membre"
            })
        });
        const data = await response.json();
        if(data.success) {
            alert("Profil enregistré sur le serveur !");
            closeAuth();
        }
    } catch (e) {
        alert("Erreur de connexion au serveur.");
    }
}

function checkUserStatus() {
    showAuth();
}

/* --- GESTION DES ÉVÉNEMENTS & DÉTAILS --- */
const eventData = {
    "event-101": {
        title: "Mafia Night VIP",
        date: "20 Janvier 2026",
        loc: "Club Le Privé, Paris",
        price: "45,00 €",
        desc: "Une soirée immersive dans l'univers de la Mafia des années 30. Tenue correcte exigée. Buffet premium et cocktails exclusifs inclus.",
        img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500"
    },
    "event-102": {
        title: "Gala de l'Organisation",
        date: "15 Février 2026",
        loc: "Hôtel Carlton, Cannes",
        price: "12,00 €",
        desc: "Le rendez-vous prestigieux de l'élite de NineEvent. Dîner gastronomique et orchestre symphonique pour une nuit hors du temps.",
        img: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500"
    },
    "event-3": {
        title: "Mafia Night VIP",
        date: "20 Janvier 2026",
        loc: "Club Le Privé, Paris",
        price: "5,00 €",
        desc: "Une soirée immersive dans l'univers de la Mafia des années 30. Tenue correcte exigée. Buffet premium et cocktails exclusifs inclus.",
        img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500"
    },
    "event-4": {
        title: "Mafia Pool",
        date: "04 AVRIL 2026",
        loc: "Club Le Privé, Paris",
        price: "10.000,00 Fcfa",
        desc: "Une soirée immersive dans l'univers de la Mafia des années 30. Tenue correcte exigée. Buffet premium et cocktails exclusifs inclus.",
        img: "https://i.postimg.cc/3w5xp0By/9privat_night_minii.png"
    }
};

function openDetails(idOrTitle, date, loc, price, img) {
    const detailsPage = document.getElementById('eventDetailsPage');
    
    if (eventData[idOrTitle]) {
        const data = eventData[idOrTitle];
        document.getElementById('detTitle').innerText = data.title;
        document.getElementById('detDate').innerText = data.date;
        document.getElementById('detLoc').innerText = data.loc;
        document.getElementById('detPrice').innerText = data.price;
        document.getElementById('detDesc').innerText = data.desc;
        document.getElementById('detImg').src = data.img;
    } else {
        document.getElementById('detTitle').innerText = idOrTitle;
        document.getElementById('detDate').innerText = date || "Date à venir";
        document.getElementById('detLoc').innerText = loc || "Lieu secret";
        document.getElementById('detPrice').innerText = price || "-- Fcfa";
        document.getElementById('detDesc').innerText = "Détails de l'événement NineEvent prochainement disponibles.";
        document.getElementById('detImg').src = img || "";
    }

    detailsPage.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeDetails() {
    document.getElementById('eventDetailsPage').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function filterEvents() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.getElementsByClassName('event-card');
    let count = 0;

    for (let i = 0; i < cards.length; i++) {
        const title = cards[i].querySelector('.event-title').innerText.toLowerCase();
        if (title.includes(input)) {
            cards[i].style.display = "block";
            count++;
        } else {
            cards[i].style.display = "none";
        }
    }
    const resultText = document.getElementById('resultCount');
    if(resultText) resultText.innerText = input ? `${count} résultat(s) trouvé(s)` : "Tous les événements";
}

/* --- LOGIQUE DE PAIEMENT --- */
async function confirmQuickBuy() {
    const phone = document.getElementById('quickPhone').value;
    const eventName = document.getElementById('detTitle').innerText;
    const priceText = document.getElementById('detPrice').innerText;
    const price = parseFloat(priceText.replace(',', '.').replace(/[^\d.-]/g, ''));

    if (!phone) return alert("Veuillez entrer votre numéro.");

    try {
        const response = await fetch(`${API_URL}/quick-buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                event_name: eventName, 
                telephone: phone, 
                prix_total: price 
            })
        });
        const data = await response.json();

        if (data.success) {
            document.getElementById('displayTicketID').innerText = data.ticket.ticket_id_public;
            document.getElementById('quickPurchase').style.display = 'none';
            document.getElementById('ticketPaymentSection').style.display = 'block';
            updateProgressUI(data.ticket);
            alert("Ticket réservé ! Votre ID de paiement est : " + data.ticket.ticket_id_public);
        }
    } catch (e) { alert("Erreur de connexion au serveur."); }
}

async function processPartialPayment() {
    const idPublic = document.getElementById('displayTicketID').innerText;
    const montantInput = document.getElementById('payAmount');
    const montant = parseFloat(montantInput.value);

    if (!montant || montant <= 0) return alert("Entrez une somme valide.");

    try {
        const response = await fetch(`${API_URL}/pay-partial`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket_id_public: idPublic, montant: montant })
        });
        const data = await response.json();

        if (data.success) {
            updateProgressUI(data.ticket);
            montantInput.value = ""; 
            if (parseFloat(data.ticket.montant_paye) >= parseFloat(data.ticket.prix_total)) {
                alert("Félicitations ! Ticket entièrement payé.");
            }
        }
    } catch (e) { alert("Erreur lors du versement."); }
}

function updateProgressUI(ticket) {
    const total = parseFloat(ticket.prix_total);
    const paye = parseFloat(ticket.montant_paye);
    const pourcentage = (paye / total) * 100;
    const restant = total - paye;

    const progressBar = document.getElementById('paymentProgress');
    const statusText = document.getElementById('paymentStatus');
    
    if(progressBar) progressBar.style.width = pourcentage + "%";
    if(statusText) statusText.innerText = `Progression : ${pourcentage.toFixed(0)}% (Restant : ${restant.toFixed(2)} Fcfa)`;
}

/* --- PUB / ANNONCES --- */
function showAnnouncement(text, icon = "fa-tag") {
    const promoText = document.getElementById('promoText');
    const promoIcon = document.getElementById('promoIcon');
    const banner = document.getElementById('promoBanner');
    
    if(promoText) promoText.innerText = text;
    if(promoIcon) promoIcon.className = `fa-solid ${icon}`;
    if(banner) {
        banner.classList.add('show');
        setTimeout(() => { banner.classList.remove('show'); }, 20000);
    }
}
