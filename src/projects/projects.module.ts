import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { Project } from './project.entity';
import { ProjectComment } from './project-comment.entity';
import { ProjectReaction } from './project-reaction.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectComment, ProjectReaction]),
    MulterModule.register({ dest: join(process.cwd(), 'uploads') }),
  ],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}

