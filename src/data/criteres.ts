import type { Critere } from '@/types/content'

// Ordre d'affichage et de départage à égalité : resine, masse, coupe, moelle, ecorce, rameau, ongle, couleur
export const criteres: Critere[] = [
  {
    id: 'resine',
    testId: 'odeur',
    question: 'Sur une surface fraîchement coupée : y a-t-il de la résine ?',
    options: [
      { id: 'oui', label: 'Oui : odeur de résine, parfois collant' },
      { id: 'non', label: 'Non : pas d\'odeur de résine' },
    ],
    pourquoi: 'Seuls certains conifères fabriquent de la résine, dans des canaux qui parcourent le bois. Une odeur de résine écarte d\'un coup tous les feuillus.',
  },
  {
    id: 'masse',
    testId: 'soupeser',
    question: 'Soupesé ou mesuré, ce bois sec est…',
    options: [
      { id: 'leger', label: 'Léger', aide: 'densité inférieure à 0,55' },
      { id: 'moyen', label: 'Moyen', aide: 'densité de 0,55 à 0,65' },
      { id: 'lourd', label: 'Lourd', aide: 'densité supérieure à 0,65' },
    ],
    pourquoi: 'La densité dit combien de matière remplit le bois. Elle annonce sa dureté, sa résistance et la chaleur qu\'il donnera au feu.',
    note: 'Valable sur bois sec. Un bois fraîchement coupé est bien plus lourd à cause de l\'eau qu\'il contient.',
  },
  {
    id: 'coupe',
    testId: 'coupe',
    question: 'À la loupe, sur le bout du bois :',
    options: [
      { id: 'pores-zone', label: 'Un anneau de gros pores au début de chaque cerne' },
      { id: 'pores-diffus', label: 'Des pores fins, répartis partout, à peine visibles' },
      { id: 'sans-pores', label: 'Aucun pore : des bandes claires et foncées bien nettes' },
    ],
    pourquoi: 'Les pores sont les vaisseaux qui conduisent la sève chez les feuillus. Leur disposition est une signature de l\'essence et explique une part de son comportement. Les conifères n\'ont pas de vaisseaux : leur bois est fait de cellules fines et allongées.',
  },
  {
    id: 'moelle',
    testId: 'coupe',
    question: 'Au centre exact d\'une tige ou d\'une branche coupée :',
    options: [
      { id: 'fine', label: 'Un point fin et plein' },
      { id: 'large-creuse', label: 'Un large cœur tendre, creux ou divisé en petites cloisons' },
    ],
    pourquoi: 'La moelle est le tissu central de la jeune tige. Chez la plupart des arbres elle reste minuscule ; chez certains arbustes elle est large, creuse ou cloisonnée, et la tige devient facile à évider.',
  },
  {
    id: 'ecorce',
    testId: 'ecorce-rameau',
    question: 'L\'écorce, si elle est présente :',
    options: [
      { id: 'grise-losanges', label: 'Grise ; lisse sur les jeunes tiges, crevassée en réseau de losanges sur les troncs' },
      { id: 'orangee-plaques', label: 'Épaisse et crevassée en bas, orangée et s\'exfoliant en fines plaques vers le haut' },
      { id: 'lisse-lenticelles', label: 'Lisse, brun-gris à cuivrée, marquée de petits traits ou points (lenticelles)' },
      { id: 'rouge-lanieres', label: 'Fine, brun-rouge, se détachant en lanières ou en plaques' },
    ],
    pourquoi: 'L\'écorce change avec l\'âge, mais chaque essence garde sa manière à elle de se fissurer ou de s\'exfolier.',
  },
  {
    id: 'rameau',
    testId: 'ecorce-rameau',
    question: 'Sur un rameau : bourgeons, aiguilles ou feuilles',
    options: [
      { id: 'bourgeons-noirs-opposes', label: 'Bourgeons noirs et veloutés, face à face' },
      { id: 'aiguilles-par-deux', label: 'Aiguilles groupées par deux, bleu-vert, un peu tordues' },
      { id: 'aiguilles-plates', label: 'Aiguilles plates, vert sombre dessus, plus claires dessous, sur deux rangs' },
      { id: 'feuilles-rondes-alternes', label: 'Feuilles arrondies, dentées, douces, en alternance le long du rameau' },
      { id: 'opposes-fleurs-jaunes', label: 'Bourgeons ou feuilles face à face ; fleurs jaunes en fin d\'hiver, avant les feuilles' },
    ],
    pourquoi: 'Quand un rameau est disponible, c\'est souvent le critère le plus sûr. La disposition face à face (opposée) ou en alternance est une signature forte.',
  },
  {
    id: 'ongle',
    testId: 'ongle',
    question: 'L\'ongle du pouce, pressé fort sur une face lisse :',
    options: [
      { id: 'marque', label: 'Laisse une trace' },
      { id: 'resiste', label: 'Ne laisse presque rien' },
    ],
    pourquoi: 'Un test de dureté de surface sans outil. Un bois tendre se marque : il se travaille facilement, mais s\'use vite.',
  },
  {
    id: 'couleur',
    testId: 'coupe',
    question: 'Sur une coupe fraîche, le centre du bois est…',
    options: [
      { id: 'clair', label: 'De la même teinte claire que le reste' },
      { id: 'coeur-colore', label: 'Nettement plus foncé ou coloré que la périphérie' },
    ],
    pourquoi: 'En vieillissant, le centre du tronc cesse de conduire la sève et se charge de substances qui le colorent et souvent le protègent : c\'est le cœur, ou duramen. La bande claire autour, l\'aubier, est le bois encore vivant.',
  },
]
