export default function handler(req, res) {
  const { id } = req.query;
  return res.status(200).json({
    berhasil_masuk_api: true,
    id_yang_diterima: id,
    query_lengkap: req.query
  });
}
