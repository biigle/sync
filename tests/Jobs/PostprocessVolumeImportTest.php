<?php

namespace Biigle\Tests\Modules\Sync\Jobs;

use Queue;
use TestCase;
use Biigle\Tests\ImageTest;
use Biigle\Tests\AnnotationTest;
use Biigle\Jobs\ProcessNewImages;
use Biigle\Modules\Sync\Jobs\PostprocessVolumeImport;
use Biigle\Modules\Largo\Jobs\GenerateAnnotationPatch;

class PostprocessVolumeImportTest extends TestCase
{
    public function testHandleVolumeImages()
    {
        $image = ImageTest::create();
        $job = new PostprocessVolumeImport(collect([$image->volume]));
        $job->handle();
        Queue::assertPushed(ProcessNewImages::class);
        Queue::assertNotPushed(GenerateAnnotationPatch::class);
    }

    public function testHandleAnnotationPatches()
    {
        $annotation = AnnotationTest::create();
        $job = new PostprocessVolumeImport(collect([$annotation->image->volume]));
        $job->handle();
        // One job for the creation of the annotation and one job by
        // PostprocessVolumeImport.
        $this->assertCount(2, Queue::pushed(GenerateAnnotationPatch::class));
    }
}