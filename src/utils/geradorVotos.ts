export function gerarVotosTeste(){

  const candidatos = [
    { number: 10, name: "Carlos Silva" },
    { number: 20, name: "Maria Souza" },
    { number: 30, name: "João Pereira" }
  ];

  const municipios = [
    "Centro","Boa Vista","São José",
    "Lagoa","Cruzeiro","Industrial"
  ];

  let votos:any[] = [];

  for(let i=0;i<100;i++){

    let sorteio = Math.random();
    let candidato;

    if(sorteio < 0.55){
      candidato = candidatos[0];
    }else if(sorteio < 0.85){
      candidato = candidatos[1];
    }else{
      candidato = candidatos[2];
    }

    let agora = new Date();
    let passado = new Date(
      agora.getTime() - Math.random()*5*60*60*1000
    );

    votos.push({
      candidateName: candidato.name,
      candidateNumber: candidato.number,
      municipio: municipios[Math.floor(Math.random()*municipios.length)],
      timestamp: passado.toISOString()
    });

  }

  localStorage.setItem("votes", JSON.stringify(votos));

  alert("✅ 100 votos gerados com sucesso");
}