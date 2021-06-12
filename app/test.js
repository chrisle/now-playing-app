const Blowfish = require('egoroof-blowfish');
const Sqlite3 = require('@journeyapps/sqlcipher');
const os = require('os');
const fs = require('fs');

const MAGIC = 'ZOwUlUZYqe9Rdm6j';

const SQL = `
  SELECT
    h.ID,
    h.created_at,
    c.FolderPath,
    c.Title AS TrackTitle,
    a.Name AS ArtistName,
    c.ImagePath,
    c.BPM,
    c.Rating,
    c.ReleASeYear,
    c.ReleASeDate,
    c.Length,
    c.ColorID,
    c.Commnt AS TrackComment,
    co.Commnt AS ColorName,
    al.Name AS AlbumName,
    la.Name AS LabelName,
    ge.Name AS GenreName,
    k.ScaleName AS KeyName,
    rmx.Name AS RemixerName,
    c.DeliveryComment AS Message,
    c.SrcAlbumName AS test
  FROM djmdSongHistory AS h
  JOIN djmdContent AS c ON h.ContentID = c.ID
  LEFT JOIN djmdColor AS co ON c.ColorID = co.id
  LEFT JOIN djmdArtist AS a ON c.ArtistID = a.ID
  LEFT JOIN djmdArtist AS rmx ON c.RemixerID = rmx.ID
  LEFT JOIN djmdAlbum AS al ON c.AlbumID = al.ID
  LEFT JOIN djmdLabel AS la ON c.LabelID = la.ID
  LEFT JOIN djmdGenre AS ge ON c.GenreID = ge.ID
  LEFT JOIN djmdKey AS k ON c.KeyID=k.ID
  ORDER BY h.created_at DESC
  LIMIT 1`;

const optionsFile = '../_test_/options.json';

function getDbPath() {
  const f = fs.readFileSync(optionsFile);
  const data = JSON.parse(f.toString());
  return data.options.filter((e) => e[0] === 'db-path')[0][1];
}

function dbPath() {
  return '../_test_/master.db';
}

function decryptPw(encryptedPw) {
  const bf = new Blowfish(MAGIC, Blowfish.MODE.ECB, Blowfish.PADDING.PKCS5);
  return bf
    .decode(Buffer.from(encryptedPw, 'base64'), Blowfish.TYPE.STRING)
    .trim();
}

function getEncryptedPw() {
  const f = fs.readFileSync(optionsFile);
  const data = JSON.parse(f.toString());
  return data.options.filter((e) => e[0] === 'dp')[0][1];
}

const db = new Sqlite3.Database(dbPath());
const decryptedPw = decryptPw(getEncryptedPw());


db.serialize(() => {
  db.run('PRAGMA cipher_compatibility = 3');
  db.run(`PRAGMA key = '${decryptedPw}'`);
  console.log(`PRAGMA key = '${decryptedPw}'`);

  db.all(SQL, [], (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }
    rows.forEach((row) => {
      console.log(row);
    });

  });
});
db.close();