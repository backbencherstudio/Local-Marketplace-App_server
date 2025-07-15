import { Test, TestingModule } from '@nestjs/testing';
import { CreatePostController } from './create-post.controller';
import { CreatePostService } from './create-post.service';

describe('CreatePostController', () => {
  let controller: CreatePostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreatePostController],
      providers: [CreatePostService],
    }).compile();

    controller = module.get<CreatePostController>(CreatePostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
