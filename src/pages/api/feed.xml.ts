import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Redirect to the main RSS feed
  res.redirect(301, '/api/rss.xml')
}