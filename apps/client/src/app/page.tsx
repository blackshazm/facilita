import { 
  Wrench, 
  Droplets, 
  Zap, 
  Paintbrush, 
  Hammer, 
  Leaf, 
  Wind, 
  Home, 
  Monitor, 
  BookOpen, 
  PartyPopper, 
  Dog, 
  Scissors,
  Search,
  Star
} from "lucide-react";

const categories = [
  { id: 1, name: "Limpeza", icon: Home, color: "bg-blue-500" },
  { id: 2, name: "Elétrica", icon: Zap, color: "bg-yellow-500" },
  { id: 3, name: "Hidráulica", icon: Droplets, color: "bg-cyan-500" },
  { id: 4, name: "Pintura", icon: Paintbrush, color: "bg-orange-500" },
  { id: 5, name: "Montagem", icon: Hammer, color: "bg-purple-500" },
  { id: 6, name: "Jardinagem", icon: Leaf, color: "bg-green-500" },
  { id: 7, name: "Ar Condicionado", icon: Wind, color: "bg-sky-500" },
  { id: 8, name: "Reformas", icon: Wrench, color: "bg-red-500" },
  { id: 9, name: "Informática/TI", icon: Monitor, color: "bg-indigo-500" },
  { id: 10, name: "Aulas", icon: BookOpen, color: "bg-pink-500" },
  { id: 11, name: "Eventos", icon: PartyPopper, color: "bg-fuchsia-500" },
  { id: 12, name: "Pet Care", icon: Dog, color: "bg-amber-500" },
  { id: 13, name: "Beleza", icon: Scissors, color: "bg-rose-500" },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50 dark:bg-emerald-950">
      {/* Hero Section */}
      <div className="w-full bg-emerald-900 px-6 py-16 text-center text-white">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
          FACILITA
        </h1>
        <p className="mt-4 text-xl text-emerald-100">
          O serviço que você precisa, com a confiança que você merece.
        </p>
        
        <div className="mx-auto mt-10 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Qual serviço você procura hoje?"
              className="w-full rounded-full border-none py-4 pl-12 pr-4 text-slate-900 shadow-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Categorias</h2>
          <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">Ver todas</button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {categories.map((cat) => (
            <button 
              key={cat.id}
              className="group flex flex-col items-center rounded-2xl bg-white p-6 shadow-sm transition-all hover:scale-105 hover:shadow-md dark:bg-emerald-900/50"
            >
              <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${cat.color} bg-opacity-10 text-white group-hover:scale-110 transition-transform`}>
                <cat.icon className={`h-8 w-8 ${cat.color.replace('bg-', 'text-')}`} />
              </div>
              <span className="text-center text-sm font-medium text-slate-700 dark:text-emerald-50">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Section */}
      <div className="container mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-emerald-100 p-8 dark:bg-emerald-900">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="max-w-md">
              <h3 className="mb-4 text-2xl font-bold text-emerald-900 dark:text-emerald-50">Garantia FACILITA</h3>
              <p className="text-emerald-800 dark:text-emerald-200">
                Todos os serviços realizados através da plataforma possuem garantia total e pagamento protegido via Escrow.
              </p>
              <button className="mt-6 rounded-xl bg-emerald-800 px-6 py-3 font-bold text-white transition-colors hover:bg-emerald-900">
                Saiba Mais
              </button>
            </div>
            <div className="flex gap-4">
               <div className="flex flex-col items-center">
                 <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-50">4.9/5</div>
                 <div className="flex text-yellow-500"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
                 <div className="text-xs text-emerald-700 dark:text-emerald-300">Avaliação Média</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
