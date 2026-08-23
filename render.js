const text = await window.yamlReady;

function formatDateISO(date) {
  return date.toISOString().slice(0, 10);
}

function formatProgress(n, of) {
  return `${n} / ${of} færdige`;
}

function renderCategory(category, done) {
  const section = document.createElement("section");
  section.className = "category";
  if (category.mandatory)
    section.dataset.id = "mandatory";

  const h2 = document.createElement("h2");
  h2.textContent = category.name;
  section.append(h2);

  const progress = document.createElement("p");
  progress.className = "progress";
  section.append(progress);

  const ul = document.createElement("ul");
  ul.role = "list";
  section.append(ul);

  for (const item of category.items) {
    ul.append(renderItem(item, done));
  }

  updateProgress(section);

  return section;
}

function renderItem(item, done) {
  const li = document.createElement("li");

  const label = document.createElement("label");
  li.append(label);

  const box = document.createElement("input");
  box.type = "checkbox";
  box.dataset.id = item.id;
  box.checked = item.id in done;
  label.append(box);

  label.append(item.title);

  if (item.due) {
    const iso = formatDateISO(item.due);

    const time = document.createElement("time");
    time.dateTime = iso;
    // TODO: Format as Danish date
    time.textContent = " før " + iso;
    label.append(time);
  }

  return li;
}

function loadDone() {
  return JSON.parse(localStorage.getItem("done")) ?? {};
}

function updateProgress(section) {
  const boxes = [...section.querySelectorAll("input[type=checkbox]")]; // unpack
  const n = boxes.filter(b => b.checked).length;
  section.querySelector(".progress").textContent = formatProgress(n, boxes.length);
}

const data = jsyaml.load(text);
const done = loadDone();
for (const category of data.categories) {
  document.querySelector("body").append(renderCategory(category, done));
}

document.addEventListener("change", (e) => {
  const box = e.target;
  if (!(box instanceof HTMLInputElement) || !box.dataset.id) return;

  const id = box.dataset.id;
  if (box.checked)
    done[id] = formatDateISO(new Date());
  else
    delete done[id];

  localStorage.setItem("done", JSON.stringify(done));
  updateProgress(box.closest(".category"));
});
