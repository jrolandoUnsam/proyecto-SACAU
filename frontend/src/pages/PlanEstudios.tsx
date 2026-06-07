export default function PlanEstudios() {
  const pdfUrl = "/Licenciatura-en-Nutricion.pdf";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Plan de Estudios — Licenciatura en Nutrición</h1>
        <a
          href={pdfUrl}
          download
          className="bg-slate-900 text-white rounded px-4 py-2 text-sm hover:bg-slate-700"
        >
          Descargar PDF
        </a>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <embed
          src={pdfUrl}
          type="application/pdf"
          width="100%"
          height="700px"
          className="block"
        />
        <div className="p-4 border-t text-sm text-slate-500">
          Si el visor no carga,{" "}
          <a href={pdfUrl} target="_blank" rel="noreferrer" className="underline text-slate-700">
            abrí el PDF en una nueva pestaña
          </a>
          .
        </div>
      </div>
    </div>
  );
}
