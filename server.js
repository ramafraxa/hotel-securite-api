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



// Route pour récupérer les produits
app.get('/produits', (req, res) => {
  db.query('SELECT * FROM `produits`', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des produits :', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Route pour ajouter un produit
app.post('/addProduit', (req, res) => {
  const { numeroProduit, designation, prixProduit, typeProduit } = req.body;

  // Debug des données reçues
  console.log('Données reçues pour ajout de produit:', req.body);

  const query = 'INSERT INTO `produits`(`numeroProduit`, `designation`, `prixProduit`, `typeProduit`) VALUES (?,?,?,?)';
  db.query(query, [numeroProduit, designation,  prixProduit, typeProduit], (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'ajout du produit :', err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'Ajout ajouté avec succès' });
    }
  });
});

app.put('/updateProduit/:id', (req, res) => {
  const { id } = req.params;
  const { numeroProduit ,designation,  prixProduit, typeProduit } = req.body;

  console.log('Données reçues pour mise à jour :', req.body);

  const query = 'UPDATE `produits` SET `numeroProduit`=?,`designation`=?,`prixProduit`=?,`typeProduit`=? WHERE `id`=?';
  db.query(query, [numeroProduit,designation, prixProduit, typeProduit, id], (err, results) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du produit:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Produit modifié avec succès' });
    }
  });
});
app.delete('/deleteProduit/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM `produits` WHERE `id`=?';
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Produit supprimé avec succès' });
    }
  });
});
// Route pour récupérer les commandes
app.get('/commande1', (req, res) => {
  db.query('SELECT * FROM `v_facture3`', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des commandes :', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Route pour récupérer les commandes
app.get('/commande', (req, res) => {
  db.query('SELECT * FROM `v_facture`', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des commandes :', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Route pour récupérer les commandes
app.get('/com', (req, res) => {
  db.query('SELECT * FROM `commandes`', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des commandes :', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Route pour ajouter un commande
app.post('/addCommande', (req, res) => {
  const {  produits, idc } = req.body;
  // Debug des données reçues
  console.log('Données reçues pour ajout de client:', req.body);

    // Insérer les produits après la vérification
    produits.forEach((produit, index) => {
      const { quantite, id } = produit;

      const query = 'INSERT INTO `ligneCommande`( `quantite`, `produits_id`, `commandes_id`) VALUES (?,?,?)';
      db.query(query, [ quantite, id, idc], (err, results) => {
        if (err) {
          console.error('Erreur lors de l\'ajout du commande :', err);
          // On retourne une réponse uniquement pour la première erreur
          if (index === 0) {
            return res.status(500).json({ error: err.message });
          }
        }

        // Si tout est correct, retourner une seule réponse après la dernière insertion
        if (index === produits.length - 1) {
          res.status(201).json({ message: 'Commande ajoutée avec succès' });
        }
      });
    });
  });


/// Route pour ajouter un commande
app.post('/addCom', (req, res) => {
  const { numeroCommande, dateCommande, idn } = req.body;

  // Debug des données reçues
  console.log('Données reçues pour ajout de commande:', req.body);

  const query = 'INSERT INTO `commandes`(`numeroCommande`, `dateCommande`, `clients_id`) VALUES (?,?,?)';
  db.query(query, [numeroCommande, dateCommande,idn ], (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'ajout du commande :', err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'Commande ajouté avec succès' });
    }
  });
});

app.put('/updateCommande/:codeclient', (req, res) => {
  const { codeclient } = req.params;
  const { idProduit, designationProduit, typeProduit, prixProduit, quantite, montant } = req.body;

  console.log('Données reçues pour mise à jour :', req.body);

  const query = 'UPDATE `commandes` SET `idProduit`=?,`designationProduit`=?,`typeProduit`=?,`prixProduit`=?,`quantite`=?,`montant`=? WHERE `codeclient`=?';
  db.query(query, [idProduit, designationProduit, typeProduit, prixProduit, quantite, montant, codeclient], (err, results) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du commande:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Commande modifié avec succès' });
    }
  });
});
app.delete('/deleteCommande/:codeclient', (req, res) => {
  const { codeclient } = req.params;
  const query = 'DELETE FROM `commandes` WHERE codeclient = ?';
  db.query(query, [codeclient], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Commande supprimé avec succès' });
    }
  });
});


// factures
// Get invoices
app.get('/factures', (req, res) => {
  connection.query('SELECT * FROM factures', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Create invoice
app.post('/factures', (req, res) => {
  const { client, items, total } = req.body;

  // Insert invoice data
  connection.query('INSERT INTO factures SET ?', { numFacture: items[0].numFacture, codeClient: client.codeclient, total }, (err, result) => {
    if (err) throw err;
    
    // Insert each item
    items.forEach(item => {
      connection.query('INSERT INTO factures SET ?', {
        numFacture: item.numFacture,
        codeClient: item.codeClient,
        designationFacture: item.designationFacture,
        quantiteFacture: item.quantiteFacture,
        prixUnitaireFacture: item.prixUnitaireFacture,
        total: item.quantiteFacture * item.prixUnitaireFacture
      }, (err, result) => {
        if (err) throw err;
      });
    });

    res.json({ success: true });
  });
});

// Update invoice
app.put('/factures/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  connection.query('UPDATE factures SET ? WHERE id = ?', [updatedData, id], (err, result) => {
    if (err) throw err;
    res.json({ success: true });
  });
});

// Delete invoice
app.delete('/factures/:id', (req, res) => {
  const { id } = req.params;

  connection.query('DELETE FROM factures WHERE id = ?', [id], (err, result) => {
    if (err) throw err;
    res.json({ success: true });
  });
});


// Route pour récupérer tous les contenirs
app.get('/contenir', (req, res) => {
  const sql = 'SELECT * FROM `contenirs`';
  db.query(sql, (err, results) => {
      if (err) throw err;
      res.send(results);
  });
});

// Route pour ajouter un nouveau contenir
app.post('/addContenir', (req, res) => {
  const { numFacture, idProduit, quantite } = req.body;
  const sql = 'INSERT INTO `contenirs`(`numFacture`, `idProduit`, `quantite`) VALUES (?,?,?)';
  db.query(sql, [numFacture, idProduit, quantite], (err, result) => {
      if (err) throw err;
      res.send({ message: 'Contenir ajouté avec succès.' });
  });
});

// Route pour mettre à jour un contenir
app.put('/updateContenir/:numFacture', (req, res) => {
  const { numFacture } = req.params;
  const { idProduit, quantite } = req.body;
  const sql = 'UPDATE `contenirs` SET `idProduit`=?,`quantite`=? WHERE `numFacture`=?';
  db.query(sql, [idProduit, quantite, numFacture], (err, result) => {
      if (err) throw err;
      res.send({ message: 'Contenir mis à jour avec succès.' });
  });
});

// Route pour supprimer un contenir
app.delete('/deleteContenir/:numFacture', (req, res) => {
  const { numFacture } = req.params;
  const sql = 'DELETE FROM `contenirs` WHERE `numFacture`=?';
  db.query(sql, [numFacture], (err, result) => {
      if (err) throw err;
      res.send({ message: 'Contenir supprimé avec succès.' });
  });
});


// Route pour récupérer les reglements
app.get('/reglement', (req, res) => {
  db.query('SELECT * FROM `reglement`', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des reglements :', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Route pour ajouter un reglement
app.post('/addReglement', (req, res) => {

  const { numReglement, montantAuComptant, idin, typeReglement} = req.body;
  
  // Debug des données reçues
  console.log('Données reçues pour ajout de  reglement:', req.body);

  const query = 'INSERT INTO `reglement`(`numReglement`, `payementAuComptant`, `commandes_id`, `typeReglement`) VALUES (?,?,?,?)';
  db.query(query, [numReglement, montantAuComptant, idin, typeReglement], (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'ajout du reglement :', err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'Reglement ajouté avec succès' });
    }
  });
});

app.put('/updateReglement/:id', (req, res) => {
  const { id } = req.params;
  //payementAuComptant, typeReglement, idn, numReglement
  const {numReglement, payementAuComptant, typeReglement, idn } = req.body;

  console.log('Données reçues pour mise à jour :', req.body);

  const query = 'UPDATE `reglement` SET `numReglement`=?, `payementAuComptant`=?,`typeReglement`=?,`commandes_id`=? WHERE `id`=?';
  db.query(query, [numReglement,payementAuComptant, typeReglement, idn, id], (err, results) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du reglement:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Reglement modifié avec succès' });
    }
  });
});
app.delete('/deleteReglement/:numReglement', (req, res) => {
  const { numReglement } = req.params;
  const query = 'DELETE FROM `reglements` WHERE numReglement = ?';
  db.query(query, [numReglement], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Reglement supprimé avec succès' });
    }
  });
});

// Route pour récupérer les reglers
app.get('/regler', (req, res) => {
  db.query('SELECT * FROM `reglers`', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des reglers :', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Route pour ajouter un regler
app.post('/addRegler', (req, res) => {
  const {numFacture, numReglement, montantReglement } = req.body;

  // Debug des données reçues
  console.log('Données reçues pour ajout de  regler:', req.body);

  const query = 'INSERT INTO `reglers`(`numFacture`, `numReglement`, `montantReglement`) VALUES (?,?,?)';
  db.query(query, [numFacture, numReglement, montantReglement], (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'ajout du regler :', err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'Regler ajouté avec succès' });
    }
  });
});

app.put('/updateRegler/:numReglement', (req, res) => {
  const { numReglement } = req.params;
  const { numFacture, montantReglement } = req.body;

  console.log('Données reçues pour mise à jour :', req.body);

  const query = 'UPDATE `reglers` SET `numFacture`=?,`montantReglement`=? WHERE `numReglement`=?';
  db.query(query, [numFacture, montantReglement, numReglement], (err, results) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du regler:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Regler modifié avec succès' });
    }
  });
});
app.delete('/deleteRegler/:numReglement', (req, res) => {
  const { numReglement } = req.params;
  const query = 'DELETE FROM `reglers` WHERE `numReglement` = ?';
  db.query(query, [numReglement], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Regler supprimé avec succès' });
    }
  });
});


// // Routes pour les factures
// app.get('/factures', (req, res) => {
//   db.query('SELECT * FROM factures', (err, results) => {
//     if (err) throw err;
//     res.json(results);
//   });
// });

// app.post('/clients', (req, res) => {
//   const { client_name, adresse } = req.body;
//   db.query('INSERT INTO clients (client_name, adresse) VALUES (?, ?)', [client_name, adresse], (err, results) => {
//     if (err) throw err;
//     res.json({ id: results.insertId, client_name, adresse });
//   });
// });

// Routes pour les factures
app.get('/factures', (req, res) => {
  db.query('SELECT * FROM factures', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post('/factures', (req, res) => {
  const { numFacture, codeClient, designationFacture, quantiteFacture, prixUnitaireFacture, client, adresse } = req.body;
  db.query('INSERT INTO `factures`(`numFacture`, `codeClient`, `designationFacture`, `quantiteFacture`, `prixUnitaireFacture`, `client`, `adresse`) VALUES (?,?,?,?,?,?,?)', 
    [numFacture, codeClient, designationFacture, quantiteFacture, prixUnitaireFacture, client, adresse], 
    (err, results) => {
      if (err) throw err;
      res.json({ num: results.insertnum, numFacture, codeClient, designationFacture, quantiteFacture, prixUnitaireFacture, client, adresse });
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});

module.exports = db;