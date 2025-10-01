export interface Usuario {
  id: string;
  email: string;
  roles: string[];
}

export interface RespuestaLogin {
  accessToken: string;
  refreshToken: string;
  usuario: Usuario;
}

export interface Parking {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface ConfiguracionParking {
  // Aquí se definirían los campos de la configuración del parking
}

export interface Comercio {
  id: number;
  nombre: string;
  // Aquí se definirían otros campos del DTO de Comercio
}
