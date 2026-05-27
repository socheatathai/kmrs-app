import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class LevelHierarchyService {
  canManage(actorLevel: number, targetLevel: number): boolean {
    return actorLevel < targetLevel;
  }

  assertCanManage(actorLevel: number, targetLevel: number) {
    if (!this.canManage(actorLevel, targetLevel)) {
      throw new ForbiddenException('You cannot manage this user');
    }
  }
}
