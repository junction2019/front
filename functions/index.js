const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase);
let db = admin.firestore()
const got = require('got')
const fs = require('fs')
const express = require('express');
const cors = require('cors')({origin: true});
const app = express();
app.use(cors);

const emailHtml = fs.readFileSync(`${__dirname}/email1.html`, 'utf8')

const cfg = functions.config()
const apiKey = cfg.sendgrid.key

app.get('/helloWorld', (req, res) => {
  res.send("Hello from Firebase!")
})

app.get('/stats', async (req, res) => {
  const r = await db.collection('latest').doc('stats').get()
  const stats = r.data()

  const r2 = await db.collection('latest').doc('latest').get()
  const latest = r2.data()

  res.send({stats, latest})
})

app.post('/email',async (req, res) => {
  // const {body} = await got.get('https://firestore.googleapis.com/v1/projects/nackjunction/databases/(default)/documents/latest/latest', {
  //   json: true,
  // })
  const email = req.body.email || '1@inventix.ru'

  await sendEmail({
    to: {email},
    from: {email:`noreply@nackjunction.com`, name: 'Junction'},
    subject: `Action required`,
    content: emailHtml,
  })

  res.send({ok: 1})
})

exports.app = functions.https.onRequest(app)

async function sendEmail(msg) {
  const body = {
    personalizations: [
      {
        to: [msg.to],
        // cc: msg.cc,
        // bcc: msg.bcc,
      },
    ],
    from: msg.from,
    content: [
      {
        type: msg.contentType || 'text/html',
        value: msg.content,
      },
    ],
    subject: msg.subject,
    // reply_to: msg.reply_to,
  }
  console.log(msg)
  console.log(body)
  console.log(JSON.stringify(body, null, 2))

  await got.post(`https://api.sendgrid.com/v3/mail/send`, {
    json: true,
    headers: {
      authorization: `Bearer ${apiKey}`,
    },
    body,
  }).catch(err => {
    console.log(err.response.body)
    throw err
  })
}
