import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class IngestGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = process.env.INGEST_TOKEN;
    if (!token) return true;
    const auth = req.headers['authorization'] || '';
    if (!auth.startsWith('Bearer ')) return false;
    return auth.slice(7) === token;
  }
}
