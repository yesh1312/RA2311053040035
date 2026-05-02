import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page, limit, notification_type } = req.query;
  const token = process.env.NEXT_PUBLIC_API_TOKEN;
  const baseUrl = 'http://20.207.122.201/evaluation-service/notifications';

  const params = new URLSearchParams();
  if (page) params.append('page', page as string);
  if (limit) params.append('limit', limit as string);
  if (notification_type) params.append('notification_type', notification_type as string);

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
