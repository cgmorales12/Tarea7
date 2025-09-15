import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ILoginInterface } from '../Interface/ilogin.interface';
import { IUsuarioInterface } from '../Interface/iusuario.interface';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly rutaAPI = 'https://localhost:7194/api/usuarios';
  constructor(private http: HttpClient) {}

  login(ilogin: ILoginInterface): Observable<IUsuarioInterface> {
    return this.http.post<IUsuarioInterface>(this.rutaAPI + '/login', ilogin);
  }
  todos_usuarios(): Observable<IUsuarioInterface[]> {
    return this.http.get<IUsuarioInterface[]>(this.rutaAPI);
  }

  actualizar_usuario(usuario: IUsuarioInterface): Observable<IUsuarioInterface> {
    return this.http.put<IUsuarioInterface>(`${this.rutaAPI}/${usuario.id}`, usuario);
  }

  eliminar_usuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.rutaAPI}/${id}`);
  }
}
