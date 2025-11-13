"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function Menu() {
  <nav className="right-0 font-lexend fixed top-20 m-4 z-50 bg-transparent pointer-events-auto">
    <ul>
      <li>
        <Link href="/">Home</Link>
      </li>
      <li>
        <Link href="/about">About</Link>
      </li>
      <li>
        <Link href="/contact">Contact</Link>
      </li>
    </ul>
  </nav>;
}
