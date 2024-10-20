const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Configuração do banco de dados MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Substitua pelo seu usuário do MySQL
  password: '',  // Substitua pela sua senha do MySQL
  database: 'almoxarifado'
});

// Conectar ao banco de dados
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Conectado ao banco de dados MySQL');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Inserir uma nova requisição
app.post('/requisicoes', (req, res) => {
  const { numero, codigo, nome, quantidade, saldo, solicitante, transferencia, status, foto } = req.body;

  const sql = `INSERT INTO requisicoes (numero, codigo, nome, quantidade, saldo, solicitante, transferencia, status, foto)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [numero, codigo, nome, quantidade, saldo, solicitante, transferencia, status, foto], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send('Requisição inserida com sucesso');
  });
});

// Dar baixa em uma requisição
app.post('/requisicoes/baixa', (req, res) => {
  const { numero, responsavel } = req.body;

  const sqlBuscar = 'SELECT * FROM requisicoes WHERE numero = ?';
  db.query(sqlBuscar, [numero], (err, result) => {
    if (err || result.length === 0) {
      return res.status(500).send('Requisição não encontrada');
    }

    const requisicao = result[0];

    // Atualizar o saldo e mover para a tabela de baixas
    if (requisicao.saldo >= requisicao.quantidade) {
      requisicao.saldo -= requisicao.quantidade;

      const sqlInserirBaixada = `INSERT INTO requisicoes_baixadas (numero, codigo, nome, quantidade, saldo, solicitante, transferencia, status, foto, responsavel)
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      db.query(sqlInserirBaixada, [requisicao.numero, requisicao.codigo, requisicao.nome, requisicao.quantidade, requisicao.saldo, requisicao.solicitante, requisicao.transferencia, 'Baixada', requisicao.foto, responsavel], (err, result) => {
        if (err) {
          return res.status(500).send(err);
        }

        // Remover da tabela de requisições
        const sqlRemover = 'DELETE FROM requisicoes WHERE numero = ?';
        db.query(sqlRemover, [numero], (err, result) => {
          if (err) {
            return res.status(500).send(err);
          }
          res.send('Baixa realizada com sucesso');
        });
      });
    } else {
      res.status(400).send('Saldo insuficiente para realizar a baixa');
    }
  });
});

// Obter todas as requisições
app.get('/requisicoes', (req, res) => {
  const sql = 'SELECT * FROM requisicoes';
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(result);
  });
});

// Obter todas as requisições baixadas
app.get('/requisicoes_baixadas', (req, res) => {
  const sql = 'SELECT * FROM requisicoes_baixadas';
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(result);
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
