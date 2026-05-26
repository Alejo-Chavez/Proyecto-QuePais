import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthServices } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthServices);
  const router = inject(Router);

  if (auth.currentUser()) return true;

  await auth.checkSession();

  if (auth.currentUser()) return true;

  return router.parseUrl('/login');
};