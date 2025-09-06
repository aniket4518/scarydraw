export default async function getWsToken() {
 const res = await fetch("/api/token");
const data = await res.json();
console.log("JWT:", data.token);
return data.token
}