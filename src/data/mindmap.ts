// ─────────────────────────────────────────────────────────────────────────────
// TANABANA · An interactive mind map of Artificial Intelligence
// Content model. Every thread carries a Nepali story — text in English.
// ─────────────────────────────────────────────────────────────────────────────

export type CategoryId = "types" | "capabilities" | "applications" | "energy";

export type NodeKind = "root" | "category" | "leaf";

/** A further type — one sub-branch of an AI family. */
export interface SubType {
  name: string;
  line: string; // one-line plain-English explanation
}

export interface ThreadNode {
  id: string;
  kind: NodeKind;
  category: CategoryId;
  parentId: string | null;
  title: string;
  deva?: string; // Devanagari flourish
  tagline: string; // one-line definition
  description: string[]; // the definition — one or two short paragraphs
  applications: string[]; // "Where it shows up" — concrete examples
  howItWorks?: string[]; // short bullet points (the six AI families)
  subtypes?: SubType[]; // further types branching off this family
  useCase?: string; // a super interesting practical use case
}

export interface Category {
  id: CategoryId;
  title: string;
  deva: string;
  color: string;
  colorDark: string;
  blurb: string;
}

export interface CrossLink {
  a: string;
  b: string;
  note: string;
}

export const INK = "#2E2620";
export const PAPER = "#F6F1E7";
export const CARD = "#FFFDF7";
export const MUTED = "#8A7F72";

export const CATEGORIES: Record<CategoryId, Category> = {
  types: {
    id: "types",
    title: "Types of AI",
    deva: "प्रकार",
    color: "#D9536F",
    colorDark: "#A93A52",
    blurb:
      "There is no single 'AI'. It is a family of techniques, each pulling a different fibre — learning from data, seeing, reading, generating, acting. Like threads in a Dhaka shawl, the pattern changes depending on which fibres are twisted together.",
  },
  capabilities: {
    id: "capabilities",
    title: "Capabilities",
    deva: "क्षमता",
    color: "#17877B",
    colorDark: "#0F6A60",
    blurb:
      "What can today's AI actually do? It senses, reasons, remembers, predicts, translates and creates — often impressively, occasionally confidently wrong. Knowing the strength and the slack of each thread tells us where AI truly helps.",
  },
  applications: {
    id: "applications",
    title: "Applications in Nepal",
    deva: "प्रयोग",
    color: "#DD7A2E",
    colorDark: "#B25E1D",
    blurb:
      "From Kalimati's vegetable prices to flood warnings in the high Himalaya, AI is already threaded into Nepali life. These are not futures to wait for — they are systems already running, some built here, some arriving from abroad.",
  },
  energy: {
    id: "energy",
    title: "Energy & Environment",
    deva: "ऊर्जा",
    color: "#4C8C4A",
    colorDark: "#39703A",
    blurb:
      "Every line of generated text is spun with electricity. Training and running large models costs megawatts, litres of cooling water and tonnes of mined metal. The question for Nepal — a country of rivers — is who pays, and who could gain.",
  },
};

export const CATEGORY_ORDER: CategoryId[] = [
  "types",
  "capabilities",
  "applications",
  "energy",
];

// ── Nodes ────────────────────────────────────────────────────────────────────

export const ROOT: ThreadNode = {
  id: "root",
  kind: "root",
  category: "types", // cosmetic; root spans all
  parentId: null,
  title: "Artificial Intelligence",
  deva: "कृत्रिम बुद्धिमत्ता",
  tagline: "Where all the threads of intelligence meet — pull one to begin.",
  description: [
    "Artificial intelligence is the craft of making machines do things that once required a human mind — recognising a face, finishing a sentence, steering a tractor, drafting a letter. AI itself creates nothing from nothing: it takes threads that already exist — data, mathematics, code, and human intention — and weaves them into patterns that can surprise even their makers.",
    "ताना (tana) is the warp — the fixed vertical threads. बाना (bana) is the weft — the thread passed through them. This map is a piece of cloth: some patterns are beautiful (faster diagnosis, translations into Maithili, flood warnings shouted up a valley) and some are tangled (bias, surveillance, a rising hunger for electricity). Pull every thread, and decide how the fabric of intelligence should be woven here, in Nepal, and everywhere.",
  ],
  applications: [],
};

export const NODES: ThreadNode[] = [
  // ═══════════════════════ TYPES ═══════════════════════
  {
    id: "rulebased",
    kind: "leaf",
    category: "types",
    parentId: "cat-types",
    title: "Rule-Based AI",
    tagline:
      "Machines that follow instructions written by hand — every decision traceable to a rule a person typed.",
    description: [
      "The oldest and simplest kind of AI is a stack of rules: IF the patient has a fever AND a rash, THEN consider this diagnosis. A human expert writes the rules, a programmer turns them into code, and the machine applies them at lightning speed — millions of times a second, without ever getting tired. No learning happens; the intelligence sits entirely in the rules someone wrote.",
      "Rule-based systems are easy to trust — they can always explain which rule fired — and easy to break: the real world is messier than any rulebook. Most modern AI swapped rules for learning, but rule engines still run quietly inside banks, hospitals, telecoms and government offices everywhere, Nepal included.",
    ],
    applications: [
      "Phone top-up and billing systems",
      "Bank loan eligibility screens",
      "Traffic-signal timers",
      "Scripted customer-care chatbots",
    ],
    howItWorks: [
      "A human expert writes the rules: IF this AND that, THEN do the other.",
      "The machine matches what it sees against the rules, one by one, at incredible speed.",
      "It can always show you exactly which rule fired — nothing is hidden.",
      "It never improves on its own: a new situation means new rules, rewritten by hand.",
    ],
    subtypes: [
      {
        name: "Expert Systems",
        line: "A specialist's knowledge bottled as rules — early medical and farming advisors worked this way.",
      },
      {
        name: "Search & Optimisation",
        line: "Trying possibilities in a smart order to find the best one — how maps pick your fastest route.",
      },
      {
        name: "Knowledge Graphs",
        line: "Facts stored as connected things and relationships — 'Kathmandu is the capital of Nepal' becomes a link the machine can follow.",
      },
      {
        name: "Fuzzy Logic",
        line: "Rules that handle 'sort of' and 'a little' instead of only yes and no — handy for real-world fuzziness like fan speeds and rice cookers.",
      },
    ],
    useCase:
      "Every time you top up your phone in Nepal and instantly receive an SMS with the exact VAT-included price, a rule-based system did the maths, checked your balance and fired the message — a decision made entirely of rules someone wrote, executed in milliseconds.",
  },
  {
    id: "ml",
    kind: "leaf",
    category: "types",
    parentId: "cat-types",
    title: "Machine Learning",
    tagline: "Programs that learn patterns from examples instead of fixed rules.",
    description: [
      "Classic software follows instructions a programmer wrote by hand. Machine learning flips that: you show a system thousands of examples — photos of tomato leaves, years of market prices — and it tunes itself until it can spot the pattern on its own. It is the engine under almost everything else on this map, from speech recognition to flood forecasting.",
      "Its quiet superpower is finding structure humans miss; its quiet danger is learning structure we never meant to teach it, including our prejudices. What it learns depends entirely on whose examples we feed it.",
    ],
    applications: [
      "Spam and fraud filters",
      "Vegetable price forecasts from Kalimati data",
      "Flood and rainfall prediction",
      "Speech and face recognition",
    ],
    howItWorks: [
      "Collect many examples — thousands of photos, prices, sentences.",
      "The model guesses, measures how wrong it was, and adjusts itself a little.",
      "Repeat millions of times until the guesses turn accurate.",
      "Show it something new and it predicts from the pattern it learned.",
    ],
    subtypes: [
      {
        name: "Supervised Learning",
        line: "Learning from labelled examples — photos already tagged 'blight' or 'healthy'. The most common kind.",
      },
      {
        name: "Unsupervised Learning",
        line: "Finding hidden structure in unlabelled data — customer groups, odd transactions — without being told what to look for.",
      },
      {
        name: "Reinforcement Learning",
        line: "Learning by trial, error and reward — how machines learned to beat chess masters and steer robots.",
      },
      {
        name: "Self-Supervised Learning",
        line: "The model invents its own quiz from raw data — 'guess the next word' — which is how today's language models got so good.",
      },
    ],
    useCase:
      "Researchers in Kathmandu feed years of Kalimati market prices into learning models that forecast the vegetable market — helping a farmer decide whether to truck tomatoes to the capital now or wait a week, a gamble that decides the family's year.",
  },
  {
    id: "neural",
    kind: "leaf",
    category: "types",
    parentId: "cat-types",
    title: "Neural Networks",
    tagline: "Layered webs of tiny mathematical neurons, loosely inspired by the brain.",
    description: [
      "A neural network is a vast grid of very simple units, each doing nothing more than basic arithmetic on its inputs. Stack thousands of these units in layers, wire them to pass messages forward, and something remarkable emerges: the network learns to recognise things — faces, words, tumours, leaves — that nobody explicitly programmed.",
      "'Deep learning' simply means many layers. Early layers notice crumbs — an edge, a curve, a phoneme — and deeper layers assemble them into meaning. This is the technique behind the current AI boom, and it is astonishingly hungry: it needs huge datasets, powerful chips and lots of electricity.",
    ],
    applications: [
      "Photo and face recognition",
      "Devanagari handwriting reading",
      "Voice assistants",
      "Crop-disease diagnosis from phone photos",
    ],
    howItWorks: [
      "Each tiny neuron takes numbers in, weighs them, and passes a signal on.",
      "Neurons are stacked in layers; each layer builds on the one before.",
      "Training nudges millions of weights up and down until the answers improve.",
      "The finished network turns raw input — pixels, sound, text — into a decision.",
    ],
    subtypes: [
      {
        name: "ANN",
        line: "Artificial Neural Network — the classic layered web of neurons; the template all the others build on.",
      },
      {
        name: "CNN",
        line: "Convolutional Neural Network — scans images tile by tile; the eye behind photo apps and medical scans.",
      },
      {
        name: "RNN",
        line: "Recurrent Neural Network — loops on itself so it can remember what came before; good for speech and time series.",
      },
      {
        name: "GNN",
        line: "Graph Neural Network — learns from networks of things: roads, friendships, molecules, trade routes.",
      },
      {
        name: "Transformer",
        line: "The attention-based architecture behind ChatGPT — reads a whole sentence at once and decides which words matter most.",
      },
    ],
    useCase:
      "Point a phone camera at a potato leaf and a CNN can name the disease in seconds — plant-diagnosis apps are becoming a pocket agronomist for farmers in Nepal's mid-hills, where one real agronomist may serve an entire district.",
  },
  {
    id: "genai",
    kind: "leaf",
    category: "types",
    parentId: "cat-types",
    title: "Generative AI",
    tagline: "Models that create new text, images, music, video and code.",
    description: [
      "Generative models don't just sort the world — they make new pieces of it. Trained on enormous datasets, they learn the statistical shape of text, images and sound well enough to continue them: write an essay, paint a paubha-styled image, compose a melody, generate working code. ChatGPT and its cousins made this the most visible face of AI almost overnight.",
      "The dazzle comes with debts. Generative systems are trained on work — writing, art, music — that was taken, often without asking or paying. They fabricate confidently. And for every beautiful AI image of Machhapuchhre at sunrise, there is an artist whose style was quietly folded into the pattern.",
    ],
    applications: [
      "ChatGPT-style writing help",
      "AI image and video generation",
      "Code autocomplete",
      "Deepfakes — the shadow side",
    ],
    howItWorks: [
      "Study enormous amounts of human-made work — text, images, audio.",
      "Learn the statistical shape: which word, colour or note tends to follow which.",
      "Generate one piece at a time — next word, next patch of pixels — at dazzling speed.",
      "Steer it with a prompt; it continues the pattern you started.",
    ],
    subtypes: [
      {
        name: "LLMs",
        line: "Large Language Models — trained on a vast slice of the internet to write, summarise, translate and code.",
      },
      {
        name: "Diffusion Models",
        line: "Start with pure noise and remove it step by step until a picture appears — how most AI image generators work.",
      },
      {
        name: "GANs",
        line: "Two networks duel — one forges images, the other detects fakes — and the forger gets frighteningly good.",
      },
      {
        name: "VAEs",
        line: "Squeeze examples into a compact code, then dream new variations back out of it.",
      },
    ],
    useCase:
      "Type 'Machhapuchhre at sunrise, paubha style' and a diffusion model paints it in seconds — trained on millions of scraped images, almost never with the artists' consent. Nepali musicians and illustrators are now asking the live question: whose work made this beauty possible, and were they paid?",
  },
  {
    id: "robotics",
    kind: "leaf",
    category: "types",
    parentId: "cat-types",
    title: "Robotics & Embodied AI",
    tagline: "Intelligence with a body — hands, wheels, wings, rotors.",
    description: [
      "When AI moves off the screen and into actuators and rotors, it becomes robotics: machines that walk, grip, fly and haul. Modern robots fuse vision, planning and learning, which is why warehouse arms, delivery drones and quadruped rescuers all improved at once — they share the same underlying AI revolution.",
      "Nepal's terrain makes embodiment matter. A drone that can carry vaccines over a ridge that takes a porter six hours is not a toy; it is infrastructure. Earthquake rubble, landslide zones and glacier lakes are places where sending a machine first can save a human life.",
    ],
    applications: [
      "Drone medicine delivery in the hills",
      "Warehouse and factory automation",
      "Search-and-rescue robots",
      "Driver-assist and self-parking cars",
    ],
    howItWorks: [
      "Sensors sense the world — cameras, radar, touch, balance.",
      "The AI plans: where am I, what is around me, what should I do next.",
      "Motors and rotors act, and the sensors watch the result in a loop.",
      "Learning sharpens the loop — every stumble becomes data for the next try.",
    ],
    subtypes: [
      {
        name: "Factory Arms",
        line: "Welding, picking, packing — the workhorses that gave robots their first jobs.",
      },
      {
        name: "Home Robots",
        line: "Vacuums, lawn mowers and assistants that navigate our messy living rooms.",
      },
      {
        name: "Self-Driving Cars",
        line: "Vans and taxis that read the road with cameras and radar — still learning our chaos.",
      },
      {
        name: "Drones",
        line: "Flying robots that inspect, map and deliver — Nepal's mountain couriers.",
      },
      {
        name: "Humanoids",
        line: "Two-legged, general-purpose machines — today's demos, possibly tomorrow's coworkers.",
      },
      {
        name: "Swarm Robots",
        line: "Hundreds of simple machines cooperating, like ants — strength in numbers.",
      },
    ],
    useCase:
      "In Nepal's hills, a delivery drone flies blood samples across a ridge in twenty minutes — a trip that takes a porter six hours on foot. When the monsoon cuts a village off, rotors carry the pharmacy.",
  },
  {
    id: "nextgen",
    kind: "leaf",
    category: "types",
    parentId: "cat-types",
    title: "Next-Generation AI",
    tagline: "Where the frontier is heading: smaller, stranger, faster — and harder to see.",
    description: [
      "Beyond today's headline models, researchers are pushing AI into new shapes: models small enough to live on your phone instead of a data centre, systems that learn without ever seeing your private data, chips wired like brains, and machines that begin to explain themselves.",
      "These matter for Nepal more than they might seem. On-device AI could bring decent translation and crop advice to villages with thin signal; federated learning could let hospitals improve a shared model without moving patient records. The next generation may be judged less by how big it is, and more by how well it fits the places the last one overlooked.",
    ],
    applications: [
      "Offline translation on cheap phones",
      "Privacy-preserving health research",
      "Ultra-low-power smart sensors",
      "Auditable government algorithms",
    ],
    howItWorks: [
      "Edge AI shrinks models so phones and small devices can run them offline.",
      "Federated learning trains a shared model by sending updates, never the raw data.",
      "Neuromorphic chips imitate the brain's spiking neurons to sip power instead of gulping it.",
      "Explainable AI (XAI) forces the machine to show its reasoning, not just its answer.",
      "Quantum AI experiments with qubits for problems classical computers cannot crack.",
    ],
    subtypes: [
      {
        name: "Edge / On-Device AI",
        line: "Runs on your phone or a small box, no internet needed — private and instant.",
      },
      {
        name: "Federated Learning",
        line: "Many phones or hospitals train one model together; the data never leaves home.",
      },
      {
        name: "Neuromorphic Chips",
        line: "Silicon that fires like neurons — dramatically more energy-efficient at some tasks.",
      },
      {
        name: "Quantum AI",
        line: "Qubits explore many answers at once — promising, early, and still mostly a lab story.",
      },
      {
        name: "Explainable AI (XAI)",
        line: "Models built to show which inputs drove a decision — vital for loans, diagnosis and justice.",
      },
    ],
    useCase:
      "Federated learning could let every district hospital in Nepal improve one shared diagnostic model — each hospital's patient records stay on its own servers, and only the mathematical lessons travel.",
  },

  // ═══════════════════════ CAPABILITIES ═══════════════════════
  {
    id: "perception",
    kind: "leaf",
    category: "capabilities",
    parentId: "cat-capabilities",
    title: "Perception",
    tagline: "Hearing, seeing, reading — turning raw signals into meaning.",
    description: [
      "Perception is AI's senses: speech recognition that turns a farmer's spoken query into text, vision models that read an X-ray or a crop leaf, document systems that pull data out of a crumpled receipt. In the last decade machine perception has crossed from lab demos into daily life — your phone's keyboard suggestions are a tiny perceiver living in your pocket.",
      "The catch is coverage. Speech recognisers are brilliant in English and mediocre in Nepali; for Kham, Surel or Baram, they simply do not exist. Perception models see best the people they were trained to see — everyone else blurs.",
    ],
    applications: [
      "Voice assistants that hear Nepali",
      "Reading X-rays and crop photos",
      "Digitising receipts and old records",
    ],
  },
  {
    id: "reasoning",
    kind: "leaf",
    category: "capabilities",
    parentId: "cat-capabilities",
    title: "Reasoning",
    tagline: "Step-by-step logic: planning, math, strategy, self-checking.",
    description: [
      "Beyond pattern-matching lies reasoning: breaking a problem into steps, checking the steps, planning around constraints. Newer models do this convincingly — solving exam math, drafting project plans, debugging code by tracing the error. It is why AI has moved from autocomplete toward 'assistant'.",
      "But reasoning can fail with total confidence. A model will derive a beautiful chain of logic from a wrong premise, or invent a citation mid-argument and never notice. Engineers call it hallucination — a dropped stitch that looks fine until you stretch the cloth. Trust, but verify — especially where a wrong answer costs money or health.",
    ],
    applications: [
      "Exam preparation and tutoring",
      "Route and schedule planning",
      "Debugging code step by step",
    ],
  },
  {
    id: "memory",
    kind: "leaf",
    category: "capabilities",
    parentId: "cat-capabilities",
    title: "Memory & Prediction",
    tagline: "Learning from the past to forecast what comes next.",
    description: [
      "Prediction is the quiet workhorse of AI: given the past, estimate the future. Rainfall records become flood forecasts; symptom reports become outbreak alerts; traffic cameras become route estimates. Machine learning excels here because patterns really do repeat — seasons, monsoons, market cycles — and a model can hold far more history than any human analyst.",
      "The limits matter as much as the powers. Models trained on yesterday's climate and yesterday's markets falter when the world shifts underneath them. A forecast is a thread of probability, not a promise — communities downstream of a glacier lake should know exactly how uncertain that thread is.",
    ],
    applications: [
      "Flood forecasting from rainfall history",
      "Outbreak early-warning systems",
      "Market and price trend prediction",
    ],
  },
  {
    id: "creativity",
    kind: "leaf",
    category: "capabilities",
    parentId: "cat-capabilities",
    title: "Creativity",
    tagline: "Composing, drawing, writing — and the question of authorship.",
    description: [
      "Ask a generative model for a madal-driven folk fusion track, a logo in Newari style, or a poem in the voice of Devkota, and it will oblige in seconds. Whether that counts as creativity is the live debate: the model recombines human work at a scale and speed no person could match, producing results that are sometimes new, always derivative of something.",
      "For working artists, writers and musicians — including Nepal's — this is not philosophy; it is livelihood. When an AI can mimic a muralist's linework for free, who pays the muralist? Some artists fight back with tools that poison training scrapers; others negotiate licences. The bargain is still being written.",
    ],
    applications: [
      "Drafting and outlining text",
      "Generating images and logos",
      "Composing folk-fusion music",
    ],
  },
  {
    id: "translation",
    kind: "leaf",
    category: "capabilities",
    parentId: "cat-capabilities",
    title: "Translation & Language",
    tagline: "Bridging Nepal's 124 languages — or leaving most behind.",
    description: [
      "Nepal's 2021 census counted 124 mother tongues. Machine translation promises to bridge them — Nepali to English for a research paper, English tutorials into Maithili, health messages into Tharu. Neural translation has made the bridges usable, and for a multilingual country the payoff is enormous: education, healthcare and governance all stop needing to wait for translation.",
      "But the bridges are uneven. High-resource language pairs are smooth; Nepali↔English is passable; Nepali↔Tamang barely exists. Low-resource languages need corpora, dictionaries and people willing to record their grandparents. AI translation can preserve a language — or accelerate its silence — depending on whose data gets collected.",
    ],
    applications: [
      "Nepali↔English document translation",
      "Subtitle generation for videos",
      "Health messages in local languages",
    ],
  },

  // ═══════════════════════ APPLICATIONS IN NEPAL ═══════════════════════
  {
    id: "agriculture",
    kind: "leaf",
    category: "applications",
    parentId: "cat-applications",
    title: "Agriculture",
    tagline: "Advisory in your pocket: crop health, prices, weather, irrigation.",
    description: [
      "Nearly two-thirds of Nepalis live off the land, and agriculture is where AI touches the most hands. Photo-based diagnosis catches blight and pests before they spread; models trained on market data help farmers decide what to plant and when to sell; weather and soil models drive smarter irrigation in a country where a bad monsoon is a family crisis.",
      "The constraints are honest ones: patchy connectivity in the hills, models trained on Indian or Chinese crops and climates, and interfaces that assume literacy. The best projects co-design with farmer groups, send voice messages in local languages, and treat AI as one tool among many — not a replacement for agricultural extension officers.",
    ],
    applications: [
      "Plant-disease photo diagnosis",
      "Kalimati price forecasts",
      "Weather-aware irrigation advice",
    ],
  },
  {
    id: "health",
    kind: "leaf",
    category: "applications",
    parentId: "cat-applications",
    title: "Health",
    tagline: "Triage, screening and translation for a hard-to-reach country.",
    description: [
      "A specialist in Kathmandu is a mountain walk away for many Nepalis. AI-assisted telehealth stretches scarce expertise: triage chatbots filter urgent cases, algorithms flag TB or diabetic retinopathy from photos and coughs, and translation models help a Maithili-speaking patient describe symptoms to a Nepali-speaking nurse. During the pandemic, AI-driven dashboards tracked case flows across provinces.",
      "The caveats are medical and ethical: models validated abroad can misread local physiology and diets; diagnostic errors here are not refundable; and health records deserve the strongest privacy protection in a country still writing its data-protection practice. AI as a junior assistant to health workers, not their replacement, is the thread being woven now.",
    ],
    applications: [
      "Telehealth triage chatbots",
      "TB and diabetic-retinopathy screening",
      "Symptom translation between patient and nurse",
    ],
  },
  {
    id: "disaster",
    kind: "leaf",
    category: "applications",
    parentId: "cat-applications",
    title: "Disaster Response",
    tagline: "Earthquakes, floods, landslides — prediction, mapping, relief.",
    description: [
      "Nepal sits where the Indian plate rams into the Eurasian one, and the 2015 Gorkha earthquake remains a living memory. AI sharpens every stage of disaster work: satellite vision maps damaged buildings hours after a quake, machine learning sifts rainfall and soil data to flag landslide risk along highways, and flood models on the Koshi and Gandaki give villages more minutes of warning.",
      "Relief logistics benefit too — routing supplies when roads are gone, matching volunteer offers to needs, and filtering rumour from signal on social media. The hard lesson of 2015 still stands, though: an algorithm is only as good as the local data and the trust behind it. A warning nobody believes protects nobody.",
    ],
    applications: [
      "Satellite damage mapping after quakes",
      "Landslide risk flags along highways",
      "Flood warnings on the Koshi",
    ],
  },
  {
    id: "tourism",
    kind: "leaf",
    category: "applications",
    parentId: "cat-applications",
    title: "Tourism & Heritage",
    tagline: "Route planning, real-time translation, digital restoration.",
    description: [
      "Tourism is one of Nepal's biggest earners, and AI is quietly upgrading it. Trekkers use AI trip planners that combine route data, weather windows and altitude profiles; translation apps let a Japanese guest negotiate with a Thakali innkeeper; vision models help digitally preserve the carved facades of Patan and Bhaktapur that the 2015 quake scarred.",
      "There are artful futures here: virtual walkthroughs of durbar squares for classrooms abroad, AI guides that tell the story of Swayambhu in the visitor's own language, crowd forecasts for Everest Base Camp that protect both the mountain and the guides. The thread to hold onto is authenticity — who tells the story, and who gets paid for it.",
    ],
    applications: [
      "AI trip planners for trekkers",
      "Real-time translation for guests",
      "3D restoration of temple carvings",
    ],
  },
  {
    id: "education",
    kind: "leaf",
    category: "applications",
    parentId: "cat-applications",
    title: "Education",
    tagline: "Tutors that adapt — if the internet reaches the village.",
    description: [
      "AI tutors promise what Nepal's classrooms struggle to provide: patient, personalised practice at scale. Adaptive apps adjust difficulty per student; language models explain a concept three ways until it clicks; teachers use AI to draft lesson plans and mark papers, buying back hours for actual teaching. For a system where one teacher may hold a class of eighty across grades, that is real leverage.",
      "But the thread has a snag: education AI assumes devices, bandwidth and electricity. Where those are thin, the same tools widen the gap between a private school in Lalitpur and a government school in Humla. And when a tutor teaches in borrowed culture and borrowed facts, someone must still check the work — teachers remain the weavers.",
    ],
    applications: [
      "Adaptive practice apps",
      "Lesson-plan drafting for teachers",
      "Automated marking",
    ],
  },
  {
    id: "langpres",
    kind: "leaf",
    category: "applications",
    parentId: "cat-applications",
    title: "Language Preservation",
    tagline: "Recording, transcribing and reviving Nepal's endangered tongues.",
    description: [
      "Of Nepal's 124 languages, many are endangered — a few, like Kusunda, are down to a handful of speakers. AI offers a rescue kit linguists could only dream of a generation ago: cheap apps that record elders telling stories, speech models that transcribe oral histories, translation pairs that give a young speaker a texting vocabulary in their grandmother's tongue.",
      "Technology cannot save a language by itself — languages live in homes, kitchens and schoolyards. But it can tip the balance of prestige: when your phone can hear your language, the language stops being 'backward'. Communities from the Tarai to Mustang are running exactly these projects now, one recorded conversation at a time.",
    ],
    applications: [
      "Recording elders' oral histories",
      "Auto-transcription of endangered tongues",
      "Texting keyboards for Tamang and Newari",
    ],
  },

  // ═══════════════════════ ENERGY & ENVIRONMENT ═══════════════════════
  {
    id: "trainingcost",
    kind: "leaf",
    category: "energy",
    parentId: "cat-energy",
    title: "Training Footprint",
    tagline: "Teaching one big model can burn as much power as a town block.",
    description: [
      "Training a frontier AI model is an industrial act: thousands of specialised chips running for weeks or months, drawing megawatts and shedding heat. Researchers have estimated single training runs producing carbon emissions comparable to several cars over their entire lifetimes — and the biggest models keep doubling in scale every few months.",
      "The footprint is unevenly shared. The emissions land where data centres are built; the benefits flow to whoever can afford the resulting models; and the demand for electricity competes with everything else a grid must serve. Efficiency is improving per calculation, but total appetite keeps growing — the thread lengthens faster than it thins.",
    ],
    applications: [
      "Weeks-long training runs on GPU farms",
      "Carbon budgets in AI research labs",
    ],
  },
  {
    id: "datacentres",
    kind: "leaf",
    category: "energy",
    parentId: "cat-energy",
    title: "Data Centres & Water",
    tagline: "The cloud is a building on a river — drinking, humming, heating.",
    description: [
      "'The cloud' is a physical estate of warehouses full of servers, and those servers are thirsty. Data centres consume electricity by the megawatt and water by the millions of litres for cooling — often in regions already stressed. As AI demand surges, operators scout sites worldwide, promising jobs and investment, sometimes straining local grids and aquifers.",
      "For Nepal the question is double-edged: could the country host green compute powered by monsoon hydropower, selling surplus as a service? And if it does, who audits the water, the land and the electricity that locals were promised first? A data centre is a neighbour for forty years — the contract should be read carefully, not signed in a hurry.",
    ],
    applications: [
      "Server warehouses cooled by millions of litres",
      "Global scouting for compute sites",
    ],
  },
  {
    id: "hydro",
    kind: "leaf",
    category: "energy",
    parentId: "cat-energy",
    title: "Nepal's Hydropower Angle",
    tagline: "A country of rivers weighing a compute economy.",
    description: [
      "Nepal holds an estimated 40,000+ megawatts of economically viable hydropower — 'green' energy by most accounting, though dams reshape rivers and valleys in ways locals know well. In the monsoon, production swells; in the dry season it shrinks. The national dream is to export surplus power and climb the income ladder — and AI compute is being pitched as the newest cargo.",
      "Compute, though, wants constant power, and rivers breathe seasonally. Batteries, storage projects and demand-flexible computing — train the model when the river is full — could square the circle, if the deals are negotiated with Nepal's interests threaded through, and not just its electricity.",
    ],
    applications: [
      "Monsoon surplus export plans",
      "Compute-park proposals on the grid",
    ],
  },
  {
    id: "hardware",
    kind: "leaf",
    category: "energy",
    parentId: "cat-energy",
    title: "Hardware & E-Waste",
    tagline: "Every chip begins as a mountain somewhere else.",
    description: [
      "AI's silicon has a supply chain with two ends of suffering. At the start: mining for silicon, cobalt and rare earths — water-hungry, sometimes conflict-tainted, almost never in the countries that consume the chips. At the end: the flow of electronic waste, as last decade's 'smart' devices and servers become this decade's toxic scrap, often processed informally by workers without protection.",
      "Nepal sits mostly downstream in this loop — a destination for second-hand electronics and a country still building e-waste management from scratch. The unfairness is visible here: the places least served by AI's benefits are frequently the ones holding its physical waste.",
    ],
    applications: [
      "Mining for silicon, cobalt and rare earths",
      "E-waste recycling yards in South Asia",
    ],
  },
  {
    id: "inference",
    kind: "leaf",
    category: "energy",
    parentId: "cat-energy",
    title: "Inference at Scale",
    tagline: "Every chat, every image, every query — electricity spent quietly.",
    description: [
      "Training happens once; inference happens forever. Every time a model answers a question, completes code or renders an image, a chip burns a sliver of power — invisible at one query, enormous at a billion. An AI-generated image is estimated to cost several times the energy of a web search; a data centre neighbourhood can now draw what a mid-sized city draws.",
      "The hopeful news: choice exists at every layer. Smaller task-specific models can be dozens of times cheaper than frontier giants; caching, batching and model distillation shave further. 'Frugal AI' is emerging as a discipline — asking, like a good weaver, how much thread the pattern actually needs.",
    ],
    applications: [
      "Every chat and AI-generated image",
      "Frugal-AI design for low-power devices",
    ],
  },
];

export const CROSS_LINKS: CrossLink[] = [
  {
    a: "neural",
    b: "translation",
    note: "Every neural translator is a web of tuned weights — the same layered architecture now reads Devanagari and writes Maithili.",
  },
  {
    a: "perception",
    b: "robotics",
    note: "A robot is perception with hands: eyes, ears and touch feed the loop that steers wheels, arms and rotors.",
  },
  {
    a: "genai",
    b: "creativity",
    note: "Generative models are creativity engines — and the reason artists are asking who owns what a machine makes.",
  },
  {
    a: "agriculture",
    b: "langpres",
    note: "Farm advisory only works when it speaks the farmer's mother tongue — voice AI in local languages is agriculture's next thread.",
  },
  {
    a: "disaster",
    b: "tourism",
    note: "Trekking routes, heritage sites and landslide zones share one risk map — disaster AI keeps visitors and monuments safe.",
  },
];

// ── Category nodes (derived) ─────────────────────────────────────────────────

const CATEGORY_TAGLINES: Record<CategoryId, string> = {
  types: "The fibres of the craft: six families of technique twisted into modern AI.",
  capabilities:
    "What the machine can actually hold: sense, reason, remember, create, translate.",
  applications:
    "Threads already woven into Nepali soil — farms, clinics, mountains, classrooms.",
  energy: "The electricity inside every answer: megawatts, rivers, heat and metal.",
};

export const CATEGORY_NODES: ThreadNode[] = CATEGORY_ORDER.map((c) => {
  const cat = CATEGORIES[c];
  return {
    id: `cat-${c}`,
    kind: "category" as const,
    category: c,
    parentId: "root",
    title: cat.title,
    deva: cat.deva,
    tagline: CATEGORY_TAGLINES[c],
    description: [cat.blurb],
    applications: [],
  };
});

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getNode(id: string): ThreadNode | undefined {
  if (id === "root") return ROOT;
  if (id.startsWith("cat-"))
    return CATEGORY_NODES.find((n) => n.id === id);
  return NODES.find((n) => n.id === id);
}

export function getChildren(id: string): ThreadNode[] {
  if (id === "root")
    return CATEGORY_ORDER.map((c) => getNode(`cat-${c}`)!).filter(Boolean);
  return NODES.filter((n) => n.parentId === id);
}

export function getAncestorChain(id: string): string[] {
  const node = getNode(id);
  if (!node) return [];
  if (node.kind === "root") return ["root"];
  return ["root", `cat-${node.category}`, node.id];
}

export function getCategoryLeafIds(cat: CategoryId): string[] {
  return NODES.filter((n) => n.category === cat && n.kind === "leaf").map(
    (n) => n.id
  );
}
