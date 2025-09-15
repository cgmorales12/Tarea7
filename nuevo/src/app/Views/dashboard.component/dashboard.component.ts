import { Component, OnInit } from '@angular/core';
import { IUsuarioInterface } from '../../Interface/iusuario.interface';
import { LoginService } from '../../service/login.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  lista_usuario: IUsuarioInterface[] = [];
  reporteCSV = '';

  constructor(private usuariosServicio: LoginService) {}

  ngOnInit(): void {
    this.usuariosServicio.todos_usuarios().subscribe((lista) => {
      console.table(lista);
      this.lista_usuario = lista;
    });
  }
  imprimir() {
    const encabezado = ['#', 'Nombre', 'Apellido', 'Email', 'Estado'];
    const filas = this.lista_usuario.map((u, i) => [
      i + 1,
      u.nombre,
      u.apellido,
      u.email,
      u.activo ? 'Usuario Activo' : 'Usuario Inactivo',
    ]);

    const lineas = [encabezado.join(' | '), ...filas.map((f) => f.join(' | '))];
    let y = 800;
    const contenido =
      lineas
        .map((linea) => {
          const texto = linea
            .replace(/\\/g, '\\\\')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)');
          const parte = `BT /F1 12 Tf 40 ${y} Td (${texto}) Tj ET`;
          y -= 20;
          return parte;
        })
        .join('\n') + '\n';

    const offsets: number[] = [];
    let pdf = '%PDF-1.3\n';

    const agregar = (obj: string) => {
      offsets.push(pdf.length);
      pdf += obj + '\n';
    };

    agregar('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
    agregar('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
    agregar(
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj'
    );
    agregar(
      `4 0 obj\n<< /Length ${contenido.length} >>\nstream\n${contenido}endstream\nendobj`
    );
    agregar('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');

    const xref = pdf.length;
    pdf += `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
    offsets.forEach((o) => {
      pdf += o.toString().padStart(10, '0') + ' 00000 n \n';
    });
    pdf += `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

    const blob = new Blob([new TextEncoder().encode(pdf)], {
      type: 'application/pdf',
    });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  private crearCSV(): string {
    const encabezados = ['id', 'nombre', 'apellido', 'email', 'activo'];
    const escape = (valor: unknown) =>
      `"${String(valor ?? '')
        .replace(/"/g, '""')
        .replace(/,/g, '\\,')}"`;

    const filas = this.lista_usuario.map((u) => [
      u.id,
      u.nombre,
      u.apellido,
      u.email,
      u.activo ? 'true' : 'false',
    ]);

    let csv = encabezados.map(escape).join(',') + '\n';
    filas.forEach((fila) => {
      csv += fila.map(escape).join(',') + '\n';
    });
    return csv;
  }

  exportarCSV() {
    const csv = this.crearCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.setAttribute('download', 'usuarios.csv');
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  }

  verReporteCSV() {
    this.reporteCSV = this.crearCSV();
  }
}
