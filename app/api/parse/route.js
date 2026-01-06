import pdf from "pdf-parse";
export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const buffer = Buffer.from(await file.arrayBuffer());
  const data = await pdf(buffer);
  const text = data.text || "";
  const sections = { Physics: [], Chemistry: [], Mathematics: [] };
  let current = "Physics";
  const lines = text.split("\n");
  for (let line of lines) {
    const t = line.trim();
    if (/CHEMISTRY/i.test(t)) current = "Chemistry";
    if (/MATHEMATICS|MATHS/i.test(t)) current = "Mathematics";
    if (/PHYSICS/i.test(t)) current = "Physics";
    const m = t.match(/^Q?(\d+)\./i);
    if (m) {
      sections[current].push({ label: m[1], id: `${current}-${m[1]}`, text: t, type: 'mcq', options: [] });
      continue;
    }
    const last = sections[current][sections[current].length-1];
    if (last) last.text += " " + t;
  }
  return Response.json(sections);
}
