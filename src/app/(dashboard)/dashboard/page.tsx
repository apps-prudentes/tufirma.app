'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSignature, TrendingUp, Calendar, Settings, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { checkSignatureLimit } from '@/lib/utils/signatureLimits';

export default function DashboardPage() {
  const [creditInfo, setCreditInfo] = useState<{ canSign: boolean; remaining: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreditInfo = async () => {
      try {
        const data = await checkSignatureLimit();
        setCreditInfo(data);
      } catch (error) {
        console.error('Error fetching credit info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditInfo();
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Cargando dashboard...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="container mx-auto px-4 py-8">
        {/* Header con Logo y Status indicator */}
        <div className="mb-12 animate-fade-in-up">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo2.webp"
                alt="Logo"
                width={250}
                height={90}
                className="h-24 w-auto cursor-pointer hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            </Link>
            {/* <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div> */}
          </div>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Card de Información del Plan */}
          <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>

            <CardHeader className="relative z-10">
              <CardDescription className="text-gray-600 font-medium">Tu Balance de Créditos</CardDescription>
              <CardTitle className="text-sm text-gray-500 mb-4">Créditos disponibles para firmar</CardTitle>

              {/* Credits Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 mb-6 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300">
                <Sparkles className="h-5 w-5 text-white animate-pulse" />
                <span className="text-2xl font-bold text-white">Créditos</span>
              </div>

              {/* Créditos Disponibles */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Créditos Disponibles</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-bold ${creditInfo?.remaining === 0 ? 'text-red-600' : 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'}`}>
                    {creditInfo?.remaining || 0}
                  </span>
                  <span className="text-sm text-gray-600">firmas disponibles</span>
                </div>
                <p className="text-xs text-gray-500">
                  {creditInfo?.remaining === 0 ? 'Sin créditos disponibles' : 'Puedes firmar PDFs'}
                </p>
              </div>

              {/* Status */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-1">Estado</p>
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${creditInfo?.canSign ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-gray-900 font-medium">
                    {creditInfo?.canSign ? 'Listo para firmar' : 'Sin créditos'}
                  </span>
                </div>
              </div>

              {/* Botón Comprar Firmas */}
              <div className="mt-6">
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
                  asChild
                >
                  <Link href="/shop" className="gap-2">
                    Comprar Créditos
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Card de Uso Reciente */}
          <Card
            className="group border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardDescription className="text-gray-600 font-medium">Uso Reciente</CardDescription>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-amber-500/30">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-sm text-gray-500 mb-8">Tus firmas más recientes</CardTitle>

              {/* Estado de Créditos */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Créditos Disponibles Ahora</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {creditInfo?.remaining || 0}
                    </span>
                    <span className="text-lg text-gray-400">firmas disponibles</span>
                  </div>
                </div>

                {/* Info adicional */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">
                    {creditInfo?.canSign
                      ? `Tienes suficientes créditos para firmar PDFs. Cada firma consume 1 crédito.`
                      : `Necesitas comprar créditos para poder firmar PDFs.`}
                  </p>
                </div>
              </div>

              {/* Historial */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-2">Historial Reciente</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Aquí aparecerá el historial de tus firmas recientes. Esta funcionalidad se puede extender en futuras
                  versiones.
                </p>
              </div>
            </CardHeader>
          </Card>

          {/* Card de Acciones */}
          <Card
            className="group border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardDescription className="text-gray-600 font-medium">Acciones</CardDescription>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-emerald-500/30">
                  <FileSignature className="h-6 w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-sm text-gray-500 mb-8">Opciones disponibles</CardTitle>

              <CardContent className="space-y-4 p-0">
                {/* Botón Firmar PDF */}
                <Button
                  asChild
                  size="lg"
                  className="w-full group/btn bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1"
                >
                  <Link href="/sign" className="gap-2">
                    <FileSignature className="h-5 w-5" />
                    Firmar un nuevo PDF
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>

                {/* Info adicional - Mostrar si no hay créditos */}
                {!creditInfo?.canSign && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100">
                      <Sparkles className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Sin créditos disponibles</p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Compra créditos en la pestaña de créditos para poder firmar PDFs nuevamente.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}