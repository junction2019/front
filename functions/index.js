const functions = require('firebase-functions')
// const got = require('got')
const fs = require('fs')

const emailHtml = fs.readFileSync('./email1.html', 'utf8')

const cfg = functions.config()
const apiKey = cfg.sendgrid.key

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!")
})

exports.email = functions.https.onRequest(async (req, res) => {
  // const {body} = await got.get('https://firestore.googleapis.com/v1/projects/nackjunction/databases/(default)/documents/latest/latest', {
  //   json: true,
  // })
  const {email} = req.body || '1@inventix.ru'

  await sendEmail({
    to: email,
    from: `noreply@nackjunction.com`,
    subject: `heartbeat`,
    content: emailHtml,
  })

  res.send({ok: 1})
})

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
  // console.log(JSON.stringify(body, null, 2))

  await got.post(`https://api.sendgrid.com/v3/mail/send`, {
    json: true,
    headers: {
      authorization: `Bearer ${apiKey}`,
    },
    body,
  })
}
