
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

export default function Voting() {

const [, setLocation] = useLocation();

const [voter, setVoter] = useState(null);
const [candidatos, setCandidatos] = useState([]);
const [selected, setSelected] = useState(null);
const [ok, setOk] = useState(false);

useEffect(() => {

const stored = localStorage.getItem("currentVoter");

if (stored) {
  setVoter(JSON.parse(stored));
} else {
  const fake = { nome: "Visitante", municipio: "Teste" };
  localStorage.setItem("currentVoter", JSON.stringify(fake));
  setVoter(fake);
}

setCandidatos([
  { numero: 10, nome: "Candidato 1", partido: "AAA" },
  { numero: 20, nome: "Candidato 2", partido: "BBB" },
  { numero: 30, nome: "Candidato 3", partido: "CCC" }
]);


}, []);   // ⭐ MUITO IMPORTANTE

function votar() {


if (!selected) return;

const votos = JSON.parse(localStorage.getItem("votes") || "[]");

votos.push({
  numero: selected,
  data: new Date().toISOString()
});

localStorage.setItem("votes", JSON.stringify(votos));

setOk(true);

setTimeout(() => {
  setLocation("/");
}, 2000);


}

if (!voter) return <Layout><p>Carregando...</p></Layout>;

if (ok) return <Layout><h2>VOTO CONFIRMADO</h2></Layout>;

return ( <Layout>


  <h1>URNA</h1>

  {candidatos.map(c => (
    <div key={c.numero}>
      <button onClick={() => setSelected(c.numero)}>
        {c.numero} - {c.nome} ({c.partido})
      </button>
    </div>
  ))}

  <Button onClick={votar}>
    CONFIRMAR
  </Button>

</Layout>


);
}
