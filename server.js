// server.js
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Phone } = require('lucide-react');

const app = express();
const port = 3000;
const username='rose';
const motdepasse='rose';
//const helmet = require('helmet');
let dataStorage = [];


// Middleware
app.use(cors());
app.use(bodyParser.json());  // Middleware pour parser le JSON
app.use(bodyParser.urlencoded({ extended: true }));

// Configure MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Votre utilisateur MySQL
  password: '', // Votre mot de passe MySQL
  database: 'hotel-secure'
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err.stack);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});


// Configure session middleware
app.use(session({
  secret: 'votreCleSecrete', // Remplacez par une clé secrète pour signer les sessions
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Mettre à true si vous utilisez HTTPS
}));


// Route pour vérifier si une empreinte est déjà enregistrée
app.get('/api/enregistrement/check/fingerprint/:fingerprintId', (req, res) => {
  const fingerprintId = req.params.fingerprintId;

  const query = 'SELECT COUNT(*) AS count FROM client WHERE empreinte = ?';
  db.query(query, [fingerprintId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification de l\'empreinte:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json(results[0].count > 0);  // Retourne true si l'empreinte est trouvée
    }
  });
});

// Route pour vérifier si une carte RFID est déjà enregistrée
app.get('/api/enregistrement/check/rfid/:rfidTag', (req, res) => {
  const rfidTag = req.params.rfidTag;

  const query = 'SELECT COUNT(*) AS count FROM client WHERE carteRfid = ?';
  db.query(query, [rfidTag], (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification du RFID:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json(results[0].count > 0);  // Retourne true si le RFID est trouvé
    }
  });
});


app.get('/api/enregistrement', (req, res) => {
  res.status(200).json(dataStorage);
});

// Route POST pour recevoir les données d'empreintes et de RFID
app.post('/api/enregistrement', (req, res) => {
  const { fingerprintId, rfidTag } = req.body;

  // Vérification si au moins une des données a été fournie
  if (!fingerprintId && !rfidTag) {
      return res.status(400).json({ error: "Données requises: ID d'empreinte ou RFID" });
  }

  // Ajouter les données reçues au stockage
  dataStorage.push({ fingerprintId, rfidTag });

  // Affichage des données reçues dans la console
  console.log('Données reçues:', req.body);

  // Réponse en cas de succès
  res.status(200).json({ message: "Données bien reçues", fingerprintId, rfidTag });
});
// Route pour récupérer les chambre
app.get('/chambre', (req, res) => {
  db.query('SELECT * FROM chambre', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des chambres :', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Route pour ajouter un chambre
 	
app.post('/addChambre', (req, res) => {
  const { numeroChambre, prix, description, typeChambre } = req.body;
  // Debug des données reçues
  console.log('Données reçues pour ajout de chambre:', req.body);
  const query = 'INSERT INTO `chambre`(`numeroChambre`, `prix`, `description`, `typeChambre`) VALUES (?,?,?,?)';
  db.query(query, [numeroChambre, prix, description, typeChambre], (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'ajout du chambre :', err);
      res.status(500).json({ error: err.message });
    } else {
     
      res.status(201).json({ message: 'Chambre ajouté avec succès' });    

    }
  });
});
//this endpoin update the room
app.put('/updateChambre/:id', (req, res) => {
  const { id} = req.params;
  const { numeroChambre, prix, description, typeChambre } = req.body;

  console.log('Données reçues pour mise à jour :', req.body);
  const query = 'UPDATE `chambre` SET `numeroChambre`=? ,`prix`=?,`description`=?,`typeChambre`=? WHERE `id`=?';
  db.query(query, [numeroChambre, prix, description, typeChambre,id], 
    (err, results) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du chambre:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Chambre modifié avec succès' });
    }
  });
});
//this methode delete
app.delete('/deleteChambre/:id', (req, res) => {
  const { id} = req.params;
  const query = 'DELETE FROM `chambre` WHERE `id`=?';
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Chambre supprimé avec succès' });
    }
  });
});

// Route pour récupérer les clients
app.get('/client', (req, res) => {
  db.query('SELECT * FROM client', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des clients :', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

//retrieve lastinsert id from client0


// Route pour ajouter un client

app.post('/addClient', (req, res) => {
  const { numeroClient, nomClient, prenomClient, telephoneClient, adresseClient, empreinte, carteRfid, genre } = req.body;

  // Debug des données reçues
  console.log('Données reçues pour ajout de client:', req.body);
	//nomClient 	prenomClient 	telephoneClient 	adresseClient 	empreinte 	carteRfid 	genre 	numeroClient 	

  const query = 'INSERT INTO `client`(`numeroClient`, `nomClient`, `prenomClient`, `telephoneClient`, `adresseClient`, `empreinte`, `carteRfid`, `genre`) VALUES (?,?,?,?,?,?,?,?)';
  db.query(query, [numeroClient, nomClient, prenomClient, telephoneClient, adresseClient, empreinte, carteRfid, genre], (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'ajout du client :', err);
      res.status(500).json({ error: err.message });
    } else {
      req.session.nomClient = nomClient;
      res.status(201).json({ message: 'Client ajouté avec succès' });
    }
  });
});

app.put('/updateClient/:id', (req, res) => {
  const { id} = req.params;
  const { numeroClient, nomClient, prenomClient, telephoneClient, adresseClient, empreinte, carteRfid, genre } = req.body;

  console.log('Données reçues pour mise à jour :', req.body);
  const query = 'UPDATE `client` SET `numeroClient`=? ,`nomClient`=?,`prenomClient`=?,`telephoneClient`=?,`adresseClient`=?,`empreinte`=?,`carteRfid`=?,`genre`=? WHERE `id`=?';
  db.query(query, [numeroClient, nomClient, prenomClient, telephoneClient, adresseClient, empreinte, carteRfid, genre,id], 
    (err, results) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du client:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Client modifié avec succès' });
    }
  });
});

app.get('/getClientName', (req, res) => {
  if (req.session.nomClient) {
    res.json({ nomClient: req.session.nomClient });
  } else {
    res.status(404).json({ message: 'Aucun nom de client trouvé dans la session' });
  }
});



app.delete('/deleteClient/:id', (req, res) => {
  const { id} = req.params;
  const query = 'DELETE FROM `client` WHERE `id`=?';
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Client supprimé avec succès' });
    }
  });
});





// Start the server
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});

module.exports = db;
