import Link from "next/link";
import { ArrowRight, PlusCircle } from "lucide-react";
import Button from "@/components/ui/Button";

export default function CreateListingCTA() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl px-8 py-12 sm:px-12 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 text-xs font-medium px-3 py-1 rounded-full mb-4">
            <PlusCircle className="h-3.5 w-3.5" />
            Gratuit et rapide
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Vous avez quelque chose à vendre ?
          </h2>
          <p className="text-gray-400 text-sm max-w-md leading-relaxed">
            Déposez votre annonce en moins de 5 minutes et touchez des milliers d&apos;acheteurs potentiels
            en Nouvelle-Calédonie.
          </p>
        </div>

        <Link href="/create" className="relative shrink-0">
          <Button size="lg" className="gap-2 whitespace-nowrap">
            Déposer une annonce
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
