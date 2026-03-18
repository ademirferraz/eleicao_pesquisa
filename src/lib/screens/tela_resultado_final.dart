// lib/screens/tela_resultado_final.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../providers/eleicao_provider.dart';
import '../models/candidato.dart';

class TelaResultadoFinal extends StatelessWidget {
  const TelaResultadoFinal({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Resultado Parcial"),
      ),
      body: Consumer<EleicaoProvider>(
        builder: (context, provider, child) {
          final total = provider.totalVotos;
          final candidatos = provider.candidatos;

          if (candidatos.isEmpty) {
            return const Center(child: Text("Ninguém cadastrado ainda."));
          }

          return Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                const Text(
                  "RANKING DOS CANDIDATOS",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 20),
                Expanded(
                  child: ListView(
                    children: [
                      SizedBox(
                        height: 250,
                        child: BarChart(
                          BarChartData(
                            alignment: BarChartAlignment.spaceAround,
                            maxY: _getMaxVotos(candidatos).toDouble() + 1,
                            barTouchData: BarTouchData(enabled: true),
                            titlesData: FlTitlesData(
                              show: true,
                              bottomTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  getTitlesWidget: (value, meta) {
                                    int index = value.toInt();
                                    if (index >= 0 && index < candidatos.length) {
                                      return SideTitleWidget(
                                        axisSide: meta.axisSide,
                                        child: Text(
                                          candidatos[index].nome.split(' ').first,
                                          style: const TextStyle(fontSize: 10),
                                        ),
                                      );
                                    }
                                    return const SizedBox();
                                  },
                                ),
                              ),
                              leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                              topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                              rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                            ),
                            gridData: const FlGridData(show: false),
                            borderData: FlBorderData(show: false),
                            barGroups: List.generate(candidatos.length, (i) {
                              return BarChartGroupData(
                                x: i,
                                barRods: [
                                  BarChartRodData(
                                    toY: candidatos[i].totalVotos.toDouble(),
                                    color: Colors.green,
                                    width: 20,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                ],
                              );
                            }),
                          ),
                        ),
                      ),
                      const SizedBox(height: 30),
                      ...candidatos.map((Candidato c) {
                        double p = total > 0 ? (c.totalVotos / total) : 0;
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8.0),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 20,
                                backgroundImage: c.fotoBytes != null ? MemoryImage(c.fotoBytes!) : null,
                                child: c.fotoBytes == null ? const Icon(Icons.person) : null,
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text("${c.nome} (${(p * 100).toStringAsFixed(1)}%)"),
                                    const SizedBox(height: 6),
                                    LinearProgressIndicator(
                                      value: p,
                                      color: Colors.green,
                                      backgroundColor: Colors.grey[200],
                                      minHeight: 8,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 10),
                              Text("${c.totalVotos}", style: const TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)),
                  child: const Text("VOLTAR"),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  int _getMaxVotos(List<Candidato> list) {
    if (list.isEmpty) return 1;
    int max = 0;
    for (var c in list) {
      if (c.totalVotos > max) max = c.totalVotos;
    }
    return max == 0 ? 1 : max;
  }
}
