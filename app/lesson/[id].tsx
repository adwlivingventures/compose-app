import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import LessonEngine from '../../components/LessonEngine';
import { LESSONS } from '../../content/lessons';

/**
 * Dynamic lesson route — /lesson/sensate-mastery, /lesson/refractory-window,
 * /lesson/partner-deescalator. Content is keyed in content/lessons.ts; an
 * unknown id lands quietly on the dashboard rather than erroring.
 */
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = id ? LESSONS[id] : undefined;

  if (!lesson) return <Redirect href="/(tabs)" />;

  return <LessonEngine lesson={lesson} />;
}
