export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  const validUser = process.env.ADMIN_USER || "ROOMUSER";
  const validPass = process.env.ADMIN_PASS || "ROOMUSER";

  if (username === validUser && password === validPass) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(401).json({ success: false, error: 'Username atau Password salah!' });
  }
}
