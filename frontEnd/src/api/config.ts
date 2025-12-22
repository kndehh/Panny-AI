let serverConfig: any = null;

export async function loadServerConfig() {
  try {
    const res = await fetch("/api/debug/config");
    if (!res.ok) return null;
    serverConfig = await res.json();
    return serverConfig;
  } catch (e) {
    serverConfig = null;
    return null;
  }
}

export function getServerConfig() {
  return serverConfig;
}

export default getServerConfig;
