import { HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // forzamos withCredentials para enviar cookies HttpOnly.
  const shouldAttachCredentials = req.url.startsWith('/api') || req.url.includes('pacheco.chillan.ubiobio.cl:8020');

  const cloned = req.clone({
    withCredentials: shouldAttachCredentials,
  });

  return next(cloned);
};
