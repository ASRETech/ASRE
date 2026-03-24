export async function fetchCommandContacts(accessToken: string) {
  const res = await fetch('https://api.command.fake/contacts', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch Command contacts');
  }

  return res.json();
}
